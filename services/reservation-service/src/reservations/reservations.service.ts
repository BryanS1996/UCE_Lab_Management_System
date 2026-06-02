import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../database/entities';
import { CreateReservationDto, UpdateReservationDto } from './dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  /**
   * Crear una nueva reserva
   * Valida que no exista conflicto de horarios
   */
  async create(createReservationDto: CreateReservationDto) {
    const { laboratory_id, user_id, start_time, end_time, purpose } =
      createReservationDto;

    // Validar que end_time sea posterior a start_time
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'end_time debe ser posterior a start_time',
      );
    }

    // Validar conflictos de horarios para el laboratorio
    const conflictingReservations = await this.reservationRepository.find({
      where: {
        laboratory_id,
        status: ReservationStatus.CONFIRMED,
      },
    });

    for (const existing of conflictingReservations) {
      if (
        (startDate >= existing.start_time && startDate < existing.end_time) ||
        (endDate > existing.start_time && endDate <= existing.end_time) ||
        (startDate <= existing.start_time && endDate >= existing.end_time)
      ) {
        throw new BadRequestException(
          'Ya existe una reserva en ese horario para este laboratorio',
        );
      }
    }

    const reservation = this.reservationRepository.create({
      laboratory_id,
      user_id,
      start_time: startDate,
      end_time: endDate,
      purpose,
      status: ReservationStatus.PENDING,
    });

    const saved = await this.reservationRepository.save(reservation);

    // TODO: Aquí se publicaría evento 'ReservationCreated' a RabbitMQ
    // await this.eventBus.publish(new ReservationCreatedEvent(saved));

    return saved;
  }

  /**
   * Obtener todas las reservas
   * Soporta filtros por laboratory_id, user_id, status
   */
  async findAll(filters?: {
    laboratory_id?: string;
    user_id?: string;
    status?: ReservationStatus;
  }) {
    const query = this.reservationRepository.createQueryBuilder('r');

    if (filters?.laboratory_id) {
      query.andWhere('r.laboratory_id = :laboratory_id', {
        laboratory_id: filters.laboratory_id,
      });
    }

    if (filters?.user_id) {
      query.andWhere('r.user_id = :user_id', { user_id: filters.user_id });
    }

    if (filters?.status) {
      query.andWhere('r.status = :status', { status: filters.status });
    }

    return query.orderBy('r.start_time', 'ASC').getMany();
  }

  /**
   * Obtener una reserva por ID
   */
  async findOne(id: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { reservation_id: id },
    });

    if (!reservation) {
      throw new NotFoundException(
        `Reserva con ID ${id} no encontrada`,
      );
    }

    return reservation;
  }

  /**
   * Actualizar una reserva
   * Valida conflictos de horarios si se modifica la fecha/hora
   */
  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.findOne(id);

    // Validar cambios de horario
    if (updateReservationDto.start_time || updateReservationDto.end_time) {
      const startDate = new Date(
        updateReservationDto.start_time || reservation.start_time,
      );
      const endDate = new Date(
        updateReservationDto.end_time || reservation.end_time,
      );

      if (endDate <= startDate) {
        throw new BadRequestException(
          'end_time debe ser posterior a start_time',
        );
      }

      // Validar conflictos solo si se cambió el laboratorio o las horas
      if (
        updateReservationDto.laboratory_id ||
        updateReservationDto.start_time ||
        updateReservationDto.end_time
      ) {
        const lab_id =
          updateReservationDto.laboratory_id || reservation.laboratory_id;

        const conflictingReservations = await this.reservationRepository.find({
          where: {
            laboratory_id: lab_id,
            status: ReservationStatus.CONFIRMED,
          },
        });

        for (const existing of conflictingReservations) {
          if (existing.reservation_id === id) continue;

          if (
            (startDate >= existing.start_time &&
              startDate < existing.end_time) ||
            (endDate > existing.start_time && endDate <= existing.end_time) ||
            (startDate <= existing.start_time && endDate >= existing.end_time)
          ) {
            throw new BadRequestException(
              'Ya existe una reserva en ese horario para este laboratorio',
            );
          }
        }
      }
    }

    Object.assign(reservation, updateReservationDto);
    const updated = await this.reservationRepository.save(reservation);

    // TODO: Aquí se publicaría evento 'ReservationUpdated' a RabbitMQ
    // await this.eventBus.publish(new ReservationUpdatedEvent(updated));

    return updated;
  }

  /**
   * Eliminar una reserva (soft delete cambiando estado a CANCELLED)
   */
  async remove(id: string) {
    const reservation = await this.findOne(id);

    reservation.status = ReservationStatus.CANCELLED;
    const cancelled = await this.reservationRepository.save(reservation);

    // TODO: Aquí se publicaría evento 'ReservationCancelled' a RabbitMQ
    // await this.eventBus.publish(new ReservationCancelledEvent(cancelled));

    return cancelled;
  }

  /**
   * Confirmar una reserva (cambiar estado de PENDING a CONFIRMED)
   */
  async confirm(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        `No se puede confirmar una reserva con estado ${reservation.status}`,
      );
    }

    reservation.status = ReservationStatus.CONFIRMED;
    const confirmed = await this.reservationRepository.save(reservation);

    // TODO: Aquí se publicaría evento 'ReservationConfirmed' a RabbitMQ
    // await this.eventBus.publish(new ReservationConfirmedEvent(confirmed));

    return confirmed;
  }
}
