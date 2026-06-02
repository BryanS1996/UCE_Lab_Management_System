import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { Laboratory } from '../database/entities';
import { Reservation, ReservationStatus } from '../database/entities';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto';

@Injectable()
export class LaboratoriesService {
  constructor(
    @InjectRepository(Laboratory)
    private readonly laboratoryRepository: Repository<Laboratory>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  /**
   * Crear un nuevo laboratorio
   */
  async create(createLaboratoryDto: CreateLaboratoryDto): Promise<Laboratory> {
    // Verificar que no exista ya un laboratorio con el mismo nombre
    const existing = await this.laboratoryRepository.findOne({
      where: { name: createLaboratoryDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un laboratorio con el nombre '${createLaboratoryDto.name}'`,
      );
    }

    const laboratory = this.laboratoryRepository.create(createLaboratoryDto);
    return this.laboratoryRepository.save(laboratory);
  }

  /**
   * Obtener todos los laboratorios
   * Filtra por is_active si se especifica
   */
  async findAll(activeOnly?: boolean): Promise<Laboratory[]> {
    if (activeOnly !== undefined) {
      return this.laboratoryRepository.find({
        where: { is_active: activeOnly },
        order: { name: 'ASC' },
      });
    }
    return this.laboratoryRepository.find({ order: { name: 'ASC' } });
  }

  /**
   * Obtener un laboratorio por ID
   */
  async findOne(id: number): Promise<Laboratory> {
    const laboratory = await this.laboratoryRepository.findOne({
      where: { lab_id: id },
    });

    if (!laboratory) {
      throw new NotFoundException(`Laboratorio con ID ${id} no encontrado`);
    }

    return laboratory;
  }

  /**
   * Actualizar un laboratorio
   */
  async update(
    id: number,
    updateLaboratoryDto: UpdateLaboratoryDto,
  ): Promise<Laboratory> {
    const laboratory = await this.findOne(id);

    // Verificar nombre duplicado si se cambia el nombre
    if (
      updateLaboratoryDto.name &&
      updateLaboratoryDto.name !== laboratory.name
    ) {
      const existing = await this.laboratoryRepository.findOne({
        where: { name: updateLaboratoryDto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un laboratorio con el nombre '${updateLaboratoryDto.name}'`,
        );
      }
    }

    Object.assign(laboratory, updateLaboratoryDto);
    return this.laboratoryRepository.save(laboratory);
  }

  /**
   * Activar / desactivar un laboratorio
   */
  async toggleActive(id: number): Promise<Laboratory> {
    const laboratory = await this.findOne(id);
    laboratory.is_active = !laboratory.is_active;
    return this.laboratoryRepository.save(laboratory);
  }

  /**
   * Eliminar un laboratorio (hard delete - solo admins)
   */
  async remove(id: number): Promise<{ message: string }> {
    const laboratory = await this.findOne(id);
    await this.laboratoryRepository.remove(laboratory);
    return { message: `Laboratorio '${laboratory.name}' eliminado correctamente` };
  }

  /**
   * Verificar disponibilidad de un laboratorio en un rango de tiempo
   * Retorna: { available, conflicting_reservations }
   */
  async checkAvailability(
    labId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<{
    available: boolean;
    laboratory: Laboratory;
    conflicting_reservations: Reservation[];
  }> {
    const laboratory = await this.findOne(labId);

    if (!laboratory.is_active) {
      return {
        available: false,
        laboratory,
        conflicting_reservations: [],
      };
    }

    // Buscar reservas que se superponen con el rango solicitado
    // Una reserva se superpone si: start < endTime AND end > startTime
    const conflictingReservations = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.lab_id = :labId', { labId })
      .andWhere('r.status IN (:...statuses)', {
        statuses: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
      })
      .andWhere('r.start_time < :endTime', { endTime })
      .andWhere('r.end_time > :startTime', { startTime })
      .getMany();

    return {
      available: conflictingReservations.length === 0,
      laboratory,
      conflicting_reservations: conflictingReservations,
    };
  }
}
