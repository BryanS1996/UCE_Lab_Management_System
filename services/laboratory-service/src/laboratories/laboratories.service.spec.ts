import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LaboratoriesService } from './laboratories.service';
import { Laboratory, LaboratoryStatus } from './entities/laboratory.entity';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { ConflictException } from '@nestjs/common';

describe('LaboratoriesService', () => {
  let service: LaboratoriesService;

  const mockLabRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRabbitmqService = {
    publishLaboratoryCreated: jest.fn(),
  };

  const mockUser = {
    user_id: '1',
    email: 'admin@uce.edu.ec',
    role: 'ADMIN',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaboratoriesService,
        {
          provide: getRepositoryToken(Laboratory),
          useValue: mockLabRepository,
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
      ],
    }).compile();

    service = module.get<LaboratoriesService>(LaboratoriesService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('CP-07 (Happy Path - Creación): Debe permitir la creación exitosa y guardar max_capacity', async () => {
      mockLabRepository.findOne.mockResolvedValue(null);
      const dto = {
        name: 'Lab Nuevo',
        max_capacity: 45,
        location: 'Bloque B',
        description: 'Nuevo lab',
      };

      const savedLab = {
        lab_id: 1,
        ...dto,
        status: LaboratoryStatus.ACTIVE,
        created_by: mockUser.email,
        updated_by: mockUser.email,
        created_at: new Date(),
      };

      mockLabRepository.create.mockReturnValue(savedLab);
      mockLabRepository.save.mockResolvedValue(savedLab);

      const result = await service.create(dto, mockUser);

      expect(mockLabRepository.save).toHaveBeenCalledTimes(1);
      expect(result.max_capacity).toBe(45);
      expect(mockRabbitmqService.publishLaboratoryCreated).toHaveBeenCalled();
    });

    // Nota: El CP-08 (Validación de max_capacity negativo) típicamente se evalúa
    // a nivel E2E o en las pruebas del Controlador, ya que class-validator
    // intercepta el Request antes de llegar al Servicio. Sin embargo, si quisiéramos
    // probarlo aquí, deberíamos invocar explícitamente validate() del class-validator.
  });
});
