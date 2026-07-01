import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LaboratoriesService } from './laboratories.service';
import { Laboratory, Reservation, ReservationStatus } from '../database/entities';
import { LaboratoryStatus } from '../database/entities/laboratory.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
};

const mockLaboratoryRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockReservationRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockLaboratory: Laboratory = {
  lab_id: 1,
  name: 'Laboratorio de Computación A',
  max_capacity: 30,
  is_active: true,
  status: LaboratoryStatus.ACTIVE,
  location: 'Bloque A - Piso 2',
  tier: 'BASIC' as any,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('LaboratoriesService', () => {
  let service: LaboratoriesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockReservationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaboratoriesService,
        {
          provide: getRepositoryToken(Laboratory),
          useValue: mockLaboratoryRepository,
        },
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    service = module.get<LaboratoriesService>(LaboratoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('debe crear un laboratorio exitosamente', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(null);
      mockLaboratoryRepository.create.mockReturnValue(mockLaboratory);
      mockLaboratoryRepository.save.mockResolvedValue(mockLaboratory);

      const result = await service.create({
        name: 'Laboratorio A',
        max_capacity: 30,
      });

      expect(result).toEqual(mockLaboratory);
    });

    it('debe lanzar ConflictException si el nombre ya existe', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);

      await expect(
        service.create({ name: 'Laboratorio A', max_capacity: 30 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne()', () => {
    it('debe retornar el laboratorio si existe', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);

      const result = await service.findOne(1);
      expect(result).toEqual(mockLaboratory);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkAvailability()', () => {
    it('debe retornar disponible si no hay conflictos', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.checkAvailability(
        1,
        new Date('2026-06-15T09:00:00Z'),
        new Date('2026-06-15T11:00:00Z'),
      );

      expect(result.available).toBe(true);
      expect(result.conflicting_reservations).toHaveLength(0);
    });

    it('debe retornar no disponible si hay conflictos', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      const conflictingReservation = {
        reservation_id: 'conflict-res',
        lab_id: 1,
        status: ReservationStatus.CONFIRMED,
      };
      mockQueryBuilder.getMany.mockResolvedValue([conflictingReservation]);

      const result = await service.checkAvailability(
        1,
        new Date('2026-06-15T09:00:00Z'),
        new Date('2026-06-15T11:00:00Z'),
      );

      expect(result.available).toBe(false);
      expect(result.conflicting_reservations).toHaveLength(1);
    });

    it('debe retornar no disponible si el laboratorio está inactivo', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue({
        ...mockLaboratory,
        is_active: false,
      });

      const result = await service.checkAvailability(
        1,
        new Date('2026-06-15T09:00:00Z'),
        new Date('2026-06-15T11:00:00Z'),
      );

      expect(result.available).toBe(false);
    });
  });

  describe('toggleActive()', () => {
    it('debe cambiar el estado activo del laboratorio', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      mockLaboratoryRepository.save.mockResolvedValue({
        ...mockLaboratory,
        is_active: false,
      });

      const result = await service.toggleActive(1);
      expect(result.is_active).toBe(false);
    });
  });
});
