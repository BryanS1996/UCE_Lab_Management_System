
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationStatus, Laboratory } from '../database/entities';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

// Mock factory for QueryBuilder
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
  getCount: jest.fn().mockResolvedValue(0),
};

const mockReservationRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockLaboratoryRepository = {
  findOne: jest.fn(),
};

const mockRabbitmqService = {
  publishReservationCreated: jest.fn().mockResolvedValue(undefined),
  publishReservationConfirmed: jest.fn().mockResolvedValue(undefined),
  publishReservationCancelled: jest.fn().mockResolvedValue(undefined),
};

const mockKafkaProducerService = {
  sendEmailNotification: jest.fn().mockResolvedValue(undefined),
};

// Mock for a regular student user
const mockUser: CurrentUserData = {
  user_id: 'user-uuid-123',
  email: 'student@uce.edu.ec',
  role: 'STUDENT',
};

// Mock for an administrator user
const mockAdminUser: CurrentUserData = {
  user_id: 'admin-uuid-456',
  email: 'admin@uce.edu.ec',
  role: 'ADMIN',
};

const mockLaboratory: Laboratory = {
  lab_id: 1,
  name: 'Laboratorio de Computación A',
  max_capacity: 30,
  is_active: true,
  location: 'Bloque A - Piso 2',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReservation: Reservation = {
  reservation_id: 'res-uuid-789',
  user_id: 'user-uuid-123',
  lab_id: 1,
  start_time: new Date('2026-06-15T09:00:00Z'),
  end_time: new Date('2026-06-15T11:00:00Z'),
  status: ReservationStatus.PENDING,
  purpose: 'Clase de Programación',
  requires_payment: false,
  version: 1,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mock query builder before each test
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockQueryBuilder.getCount.mockResolvedValue(0);
    mockReservationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
        {
          provide: getRepositoryToken(Laboratory),
          useValue: mockLaboratoryRepository,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
        {
          provide: KafkaProducerService,
          useValue: mockKafkaProducerService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  describe('create()', () => {
    // Fechas dinámicas: siempre mañana a las 10:00 y 12:00
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const mockStartTime = new Date(
      futureDate.getTime(),
    );
    mockStartTime.setHours(10, 0, 0, 0);
    const mockEndTime = new Date(
      futureDate.getTime(),
    );
    mockEndTime.setHours(12, 0, 0, 0);
    const futureStartIso = mockStartTime.toISOString();
    const futureEndIso = mockEndTime.toISOString();

    it('debe crear una reserva exitosamente', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockReservationRepository.create.mockReturnValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue(mockReservation);

      const dto = {
        lab_id: 1,
        start_time: futureStartIso,
        end_time: futureEndIso,
        purpose: 'Investigación',
      };

      const result = await service.create(dto, mockUser);

      expect(result).toEqual(mockReservation);
      expect(mockReservationRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRabbitmqService.publishReservationCreated).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar BadRequestException si end_time <= start_time', async () => {
      const dto = {
        lab_id: 1,
        start_time: futureEndIso, // invertido a propósito
        end_time: futureStartIso,
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar NotFoundException si el laboratorio no existe', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(null);

      const dto = {
        lab_id: 999,
        start_time: futureStartIso,
        end_time: futureEndIso,
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ConflictException si el laboratorio no está activo', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue({
        ...mockLaboratory,
        is_active: false,
      });

      const dto = {
        lab_id: 1,
        start_time: futureStartIso,
        end_time: futureEndIso,
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si hay conflicto de horario', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      mockQueryBuilder.getCount.mockResolvedValue(1); // Indicates a schedule conflict

      const dto = {
        lab_id: 1,
        start_time: futureStartIso,
        end_time: futureEndIso,
      };

      await expect(service.create(dto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // FIND ALL
  // ─────────────────────────────────────────────
  describe('findAll()', () => {
    it('usuario normal solo ve sus reservas', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockReservation]);

      const result = await service.findAll({}, mockUser);

      expect(result).toEqual([mockReservation]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'r.user_id = :user_id',
        { user_id: mockUser.user_id },
      );
    });

    it('admin puede ver todas las reservas', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockReservation]);

      const result = await service.findAll({}, mockAdminUser);

      expect(result).toEqual([mockReservation]);
    });
  });

  // ─────────────────────────────────────────────
  // FIND ONE
  // ─────────────────────────────────────────────
  describe('findOne()', () => {
    it('debe retornar la reserva si el usuario es el dueño', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne('res-uuid-789', mockUser);
      expect(result).toEqual(mockReservation);
    });

    it('debe lanzar NotFoundException si la reserva no existe', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('no-existe', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ForbiddenException si el usuario no es el dueño', async () => {
      mockReservationRepository.findOne.mockResolvedValue({
        ...mockReservation,
        user_id: 'otro-usuario-uuid',
      });

      await expect(service.findOne('res-uuid-789', mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('admin puede ver cualquier reserva', async () => {
      mockReservationRepository.findOne.mockResolvedValue({
        ...mockReservation,
        user_id: 'otro-usuario-uuid',
      });

      const result = await service.findOne('res-uuid-789', mockAdminUser);
      expect(result).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // CONFIRM
  // ─────────────────────────────────────────────
  describe('confirm()', () => {
    it('debe confirmar una reserva PENDING si el usuario es ADMIN', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      };
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue(confirmedReservation);

      // Pass the mockAdminUser to satisfy the 2 arguments requirement
      const result = await service.confirm('res-uuid-789', mockAdminUser);

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(mockRabbitmqService.publishReservationConfirmed).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar ForbiddenException si el usuario no es ADMIN', async () => {
      // Pass a regular mockUser, it should trigger the ForbiddenException
      await expect(
        service.confirm('res-uuid-789', mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar BadRequestException si la reserva no está PENDING', async () => {
      mockReservationRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CONFIRMED,
      });

      // Pass the mockAdminUser to bypass the role check and test the status validation
      await expect(
        service.confirm('res-uuid-789', mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────
  // REMOVE (CANCEL)
  // ─────────────────────────────────────────────
  describe('remove()', () => {
    it('debe cancelar una reserva PENDING', async () => {
      const cancelledReservation = {
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      };
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);
      mockReservationRepository.save.mockResolvedValue(cancelledReservation);

      const result = await service.remove('res-uuid-789', mockUser);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
      expect(mockRabbitmqService.publishReservationCancelled).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar BadRequestException si ya está cancelada', async () => {
      mockReservationRepository.findOne.mockResolvedValue({
        ...mockReservation,
        status: ReservationStatus.CANCELLED,
      });

      await expect(service.remove('res-uuid-789', mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});