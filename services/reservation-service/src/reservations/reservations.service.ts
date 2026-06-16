import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus, Laboratory } from '../database/entities';
import { CreateReservationDto, UpdateReservationDto } from './dto';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

interface StatsResult {
  email?: string;
  name?: string;
  count: string | number;
}

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Laboratory)
    private readonly laboratoryRepository: Repository<Laboratory>,
    private readonly rabbitmqService: RabbitmqService,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  /**
   * Create a new reservation
   * - Verifies user's JWT
   * - Verifies the laboratory exists and is active
   * - Checks for scheduling conflicts in DB (efficient query)
   * - Publishes ReservationCreated event to RabbitMQ
   */
  async create(
    createReservationDto: CreateReservationDto,
    currentUser: CurrentUserData,
  ): Promise<Reservation> {
    const { lab_id, start_time, end_time, purpose, notes } = createReservationDto;

    // 1. Validate time range
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Formato de fecha inválido');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('end_time debe ser posterior a start_time');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('No se pueden crear reservas en el pasado');
    }

    // 2. Verify that the laboratory exists and is active
    const laboratory = await this.laboratoryRepository.findOne({
      where: { lab_id },
    });

    if (!laboratory) {
      throw new NotFoundException(`Laboratorio con ID ${lab_id} no encontrado`);
    }

    if (!laboratory.is_active) {
      throw new ConflictException(
        `El laboratorio '${laboratory.name}' no está disponible actualmente`,
      );
    }

    // 3. Check for scheduling conflicts using an efficient query
    const conflictCount = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.lab_id = :lab_id', { lab_id })
      .andWhere('r.status IN (:...statuses)', {
        statuses: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
      })
      .andWhere('r.start_time < :endTime', { endTime: endDate })
      .andWhere('r.end_time > :startTime', { startTime: startDate })
      .getCount();

    if (conflictCount > 0) {
      throw new ConflictException(
        'Ya existe una reserva en ese horario para este laboratorio',
      );
    }

    // 4. Create the reservation
    const reservation = this.reservationRepository.create({
      lab_id,
      user_id: currentUser.user_id, // Taken from the JWT, not the request body
      user_email: currentUser.email,
      user_name: currentUser.email.split('@')[0],
      start_time: startDate,
      end_time: endDate,
      purpose,
      notes,
      status: ReservationStatus.PENDING,
    });

    const saved = await this.reservationRepository.save(reservation);

    // 5. Publish ReservationCreated event (fire-and-forget)
    this.rabbitmqService
      .publishReservationCreated({
        reservation_id: saved.reservation_id,
        user_id: saved.user_id,
        lab_id: saved.lab_id,
        start_time: saved.start_time,
        end_time: saved.end_time,
        purpose: saved.purpose,
      })
      .catch((err) =>
        this.logger.error('Error publicando ReservationCreated', err),
      );

    // 6. Publish Kafka event for email confirmation (fire-and-forget)
    this.kafkaProducer
      .sendEmailNotification({
        email: currentUser.email,
        userName: currentUser.email.split('@')[0],
        labName: laboratory.name,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        purpose: purpose || 'Sin motivo especificado',
        status: 'PENDING',
      })
      .catch((err) =>
        this.logger.error('Error publicando a Kafka para correo', err),
      );

    this.logger.log(
      `✅ Reserva creada: ${saved.reservation_id} para lab ${lab_id} por usuario ${currentUser.user_id}`,
    );

    return saved;
  }

  /**
   * Get all reservations with optional filters
   * - Users can only see their own reservations
   * - Admins can see all reservations
   */
  async findAll(
    filters: {
      lab_id?: number;
      user_id?: string;
      status?: ReservationStatus;
    },
    currentUser: CurrentUserData,
  ): Promise<Reservation[]> {
    const query = this.reservationRepository.createQueryBuilder('r');

    // If not an admin, the user can only view their own reservations
    if (currentUser.role !== 'ADMIN') {
      query.andWhere('r.user_id = :user_id', { user_id: currentUser.user_id });
    } else if (filters?.user_id) {
      query.andWhere('r.user_id = :user_id', { user_id: filters.user_id });
    }

    if (filters?.lab_id) {
      query.andWhere('r.lab_id = :lab_id', { lab_id: filters.lab_id });
    }

    if (filters?.status) {
      query.andWhere('r.status = :status', { status: filters.status });
    }

    return query.orderBy('r.start_time', 'ASC').getMany();
  }

  /**
   * Get reservations for the authenticated user
   */
  async findMyReservations(
    currentUser: CurrentUserData,
    status?: ReservationStatus,
  ): Promise<Reservation[]> {
    const query = this.reservationRepository
      .createQueryBuilder('r')
      .where('r.user_id = :user_id', { user_id: currentUser.user_id });

    if (status) {
      query.andWhere('r.status = :status', { status });
    }

    return query.orderBy('r.start_time', 'ASC').getMany();
  }

  /**
   * Get a single reservation by ID
   * Verifies that the user has permission to view it
   */
  async findOne(id: string, currentUser: CurrentUserData): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { reservation_id: id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    // Only the owner or an admin can view the reservation
    if (
      reservation.user_id !== currentUser.user_id &&
      currentUser.role !== 'ADMIN'
    ) {
      throw new ForbiddenException('No tienes permiso para ver esta reserva');
    }

    return reservation;
  }

  /**
   * Update a reservation
   * Only the owner or an admin can modify it
   */
  async update(
    id: string,
    updateReservationDto: UpdateReservationDto,
    currentUser: CurrentUserData,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id, currentUser);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('No se puede modificar una reserva cancelada');
    }

    // Validate schedule changes
    if (updateReservationDto.start_time || updateReservationDto.end_time) {
      const startDate = new Date(
        updateReservationDto.start_time || reservation.start_time,
      );
      const endDate = new Date(
        updateReservationDto.end_time || reservation.end_time,
      );

      if (endDate <= startDate) {
        throw new BadRequestException('end_time debe ser posterior a start_time');
      }

      const labId = updateReservationDto.lab_id ?? reservation.lab_id;

      // Check for conflicts excluding the current reservation
      const conflictCount = await this.reservationRepository
        .createQueryBuilder('r')
        .where('r.lab_id = :lab_id', { lab_id: labId })
        .andWhere('r.reservation_id != :id', { id })
        .andWhere('r.status IN (:...statuses)', {
          statuses: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
        })
        .andWhere('r.start_time < :endTime', { endTime: endDate })
        .andWhere('r.end_time > :startTime', { startTime: startDate })
        .getCount();

      if (conflictCount > 0) {
        throw new ConflictException(
          'Ya existe una reserva en ese horario para este laboratorio',
        );
      }
    }

    Object.assign(reservation, updateReservationDto);
    return this.reservationRepository.save(reservation);
  }

  /**
   * Cancel a reservation (soft delete by changing status to CANCELLED)
   * Publishes ReservationCancelled event
   */
  async remove(id: string, currentUser: CurrentUserData): Promise<Reservation> {
    const reservation = await this.findOne(id, currentUser);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    reservation.status = ReservationStatus.CANCELLED;
    const cancelled = await this.reservationRepository.save(reservation);

    // Publish ReservationCancelled event (fire-and-forget)
    this.rabbitmqService
      .publishReservationCancelled({
        reservation_id: cancelled.reservation_id,
        user_id: cancelled.user_id,
        lab_id: cancelled.lab_id,
      })
      .catch((err) =>
        this.logger.error('Error publicando ReservationCancelled', err),
      );

    this.logger.log(`🚫 Reserva cancelada: ${id}`);
    return cancelled;
  }

  /**
   * Confirm a reservation (change status PENDING → CONFIRMED)
   * Only ADMIN can confirm
   * Publishes ReservationConfirmed event
   */
  async confirm(id: string, currentUser: CurrentUserData): Promise<Reservation> {
    
    // Security check: Only administrators can confirm reservations
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden confirmar reservas');
    }

    const reservation = await this.reservationRepository.findOne({
      where: { reservation_id: id },
      relations: ['laboratory'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        `No se puede confirmar una reserva con estado '${reservation.status}'`,
      );
    }

    reservation.status = ReservationStatus.CONFIRMED;
    const confirmed = await this.reservationRepository.save(reservation);

    // Publish ReservationConfirmed event (fire-and-forget)
    this.rabbitmqService
      .publishReservationConfirmed({
        reservation_id: confirmed.reservation_id,
        user_id: confirmed.user_id,
        lab_id: confirmed.lab_id,
        start_time: confirmed.start_time,
        end_time: confirmed.end_time,
      })
      .catch((err) =>
        this.logger.error('Error publicando ReservationConfirmed', err),
      );

    // Publish Kafka event for email confirmation (fire-and-forget)
    if (confirmed.user_email) {
      this.kafkaProducer
        .sendEmailNotification({
          email: confirmed.user_email,
          userName: confirmed.user_name || confirmed.user_email.split('@')[0],
          labName: confirmed.laboratory?.name || `Laboratorio ID ${confirmed.lab_id}`,
          startTime: confirmed.start_time.toISOString(),
          endTime: confirmed.end_time.toISOString(),
          purpose: confirmed.purpose || 'Sin motivo especificado',
          status: 'CONFIRMED',
        })
        .catch((err) =>
          this.logger.error('Error publicando a Kafka para correo de confirmación', err),
        );
    }

    this.logger.log(`✅ Reserva confirmada: ${id} por el admin ${currentUser.user_id}`);
    return confirmed;
  }

  /**
   * Reject a reservation (change status PENDING → CANCELLED)
   * Only ADMIN can reject
   */
  async reject(id: string, currentUser: CurrentUserData): Promise<Reservation> {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden rechazar reservas');
    }

    const reservation = await this.reservationRepository.findOne({
      where: { reservation_id: id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        `No se puede rechazar una reserva con estado '${reservation.status}'`,
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    const rejected = await this.reservationRepository.save(reservation);

    // Publish ReservationCancelled event to RabbitMQ
    this.rabbitmqService
      .publishReservationCancelled({
        reservation_id: rejected.reservation_id,
        user_id: rejected.user_id,
        lab_id: rejected.lab_id,
      })
      .catch((err) =>
        this.logger.error('Error publicando ReservationCancelled en rechazo', err),
      );

    this.logger.log(`🚫 Reserva rechazada: ${id} por el admin ${currentUser.user_id}`);
    return rejected;
  }

  /**
   * Get administrative stats for the dashboard charts
   */
  async getAdminStats(): Promise<unknown> {
    const now = new Date();
    
    // Start of today (00:00:00 local)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of this week (Monday)
    const tempDate = new Date();
    const day = tempDate.getDay();
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(tempDate.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Count queries
    const countToday = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.start_time >= :startOfToday', { startOfToday })
      .andWhere('r.status != :status', { status: ReservationStatus.CANCELLED })
      .getCount();

    const countWeek = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.start_time >= :startOfWeek', { startOfWeek })
      .andWhere('r.status != :status', { status: ReservationStatus.CANCELLED })
      .getCount();

    const countMonth = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.start_time >= :startOfMonth', { startOfMonth })
      .andWhere('r.status != :status', { status: ReservationStatus.CANCELLED })
      .getCount();

    const topUsers = (await this.reservationRepository
      .createQueryBuilder('r')
      .select('r.user_email', 'email')
      .addSelect('COUNT(r.reservation_id)', 'count')
      .where('r.status != :status', { status: ReservationStatus.CANCELLED })
      .groupBy('r.user_email')
      .orderBy('count', 'DESC')
      .limit(3)
      .getRawMany()) as StatsResult[];

    // Top 5 laboratories (excluding cancelled)
    const topLabs = (await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('r.laboratory', 'l')
      .select('l.name', 'name')
      .addSelect('COUNT(r.reservation_id)', 'count')
      .where('r.status != :status', { status: ReservationStatus.CANCELLED })
      .groupBy('l.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany()) as StatsResult[];

    return {
      totalByPeriod: {
        day: countToday,
        week: countWeek,
        month: countMonth,
      },
      topUsers: topUsers.map(tu => ({
        email: tu.email || 'usuario@uce.edu.ec',
        count: Number(tu.count),
      })),
      topLaboratories: topLabs.map(tl => ({
        name: tl.name || 'Laboratorio',
        count: Number(tl.count),
      })),
    };
  }
}