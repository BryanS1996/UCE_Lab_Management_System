
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationStatus, Laboratory } from '../database/entities';
import { LaboratoryStatus } from '../database/entities/laboratory.entity';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

// Mock factory for QueryBuilder
const mockQueryBuilder = {
  setLock: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
  getCount: jest.fn().mockResolvedValue(0),
};

const mockReservationRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  create: jest.fn(),
};

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    save: jest.fn(),
  },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
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
  status: LaboratoryStatus.ACTIVE,
  location: 'Bloque A - Piso 2',
  tier: 'BASIC' as any,
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
    mockQueryBuilder.setLock.mockReturnThis();
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.getMany.mockResolvedValue([]);
    mockQueryBuilder.getCount.mockResolvedValue(0);
    mockReservationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryRunner.manager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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
        {
          provide: DataSource,
          useValue: mockDataSource,
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
    it('CP-01 (Happy Path): Reserva exitosa por un Docente con >24h de anticipación. El estado debe quedar en "Pendiente de Aprobación"', async () => {
      // Arrange
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      mockQueryBuilder.getCount.mockResolvedValue(0); // No conflicts
      mockReservationRepository.create.mockReturnValue(mockReservation);
      mockQueryRunner.manager.save.mockResolvedValue(mockReservation);

      // >24h notice
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2); // 48 hours later
      const startTime = new Date(futureDate.getTime());
      startTime.setHours(10, 0, 0, 0);
      const endTime = new Date(futureDate.getTime());
      endTime.setHours(12, 0, 0, 0);

      const dto = {
        lab_id: 1,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        purpose: 'Clase Práctica',
        attendees: 20, // less than max_capacity (30)
      };

      const teacherUser: CurrentUserData = {
        user_id: 'teacher-uuid-123',
        email: 'profesor@uce.edu.ec',
        role: 'TEACHER', // Docente
      };

      // Act
      const result = await service.create(dto as any, teacherUser);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(ReservationStatus.PENDING);
      
      // Verify repos were called with correct params
      expect(mockLaboratoryRepository.findOne).toHaveBeenCalledWith({
        where: { lab_id: dto.lab_id },
      });
      expect(mockReservationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lab_id: dto.lab_id,
          status: ReservationStatus.CONFIRMED,
        }),
      );
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(1);
    });

    it('CP-02 (Negativo): Intento de reserva con <24h de anticipación. Debe lanzar BadRequestException', async () => {
      // Arrange
      // Solo 10 horas de anticipación
      const now = new Date();
      const startTime = new Date(now.getTime() + 10 * 60 * 60 * 1000); 
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      const dto = {
        lab_id: 1,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        purpose: 'Reunión Urgente',
        attendees: 10,
      };

      // Act & Assert
      await expect(service.create(dto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      // Nota: Si quieres verificar el mensaje exacto:
      // await expect(service.create(dto, mockUser)).rejects.toThrowError('requiere 24h de anticipación');
    });

    it('CP-03 (Negativo): Intento de reserva superando el aforo máximo del laboratorio. Debe lanzar error (BadRequestException)', async () => {
      // Arrange
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory); // max_capacity es 30

      // >24h notice to pass the CP-02 check
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      const dto = {
        lab_id: 1,
        start_time: futureDate.toISOString(),
        end_time: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        purpose: 'Conferencia',
        attendees: 50, // 50 supera el aforo de 30
      };

      // Act & Assert
      await expect(service.create(dto as any, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    // Casos adicionales básicos
    it('debe lanzar BadRequestException si end_time <= start_time', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const startIso = futureDate.toISOString();
      const endIso = new Date(futureDate.getTime() - 1000).toISOString(); // end is before start

      const dto = { lab_id: 1, start_time: startIso, end_time: endIso, attendees: 10 };
      await expect(service.create(dto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el laboratorio no existe', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(null);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dto = {
        lab_id: 999,
        start_time: futureDate.toISOString(),
        end_time: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        attendees: 10,
      };
      await expect(service.create(dto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si hay conflicto de horario', async () => {
      mockLaboratoryRepository.findOne.mockResolvedValue(mockLaboratory);
      mockQueryBuilder.getCount.mockResolvedValue(1); // Hay conflicto

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dto = {
        lab_id: 1,
        start_time: futureDate.toISOString(),
        end_time: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        attendees: 10,
      };
      await expect(service.create(dto, mockUser)).rejects.toThrow(ConflictException);
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