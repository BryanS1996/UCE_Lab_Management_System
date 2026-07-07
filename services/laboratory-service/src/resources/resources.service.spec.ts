import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResourcesService } from './resources.service';
import {
  Resource,
  ResourceType,
} from '../laboratories/entities/resource.entity';
import { Laboratory } from '../laboratories/entities/laboratory.entity';

describe('ResourcesService', () => {
  let service: ResourcesService;

  const mockResourceRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLabRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: getRepositoryToken(Resource),
          useValue: mockResourceRepository,
        },
        {
          provide: getRepositoryToken(Laboratory),
          useValue: mockLabRepository,
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('CP-09 (Happy Path - Inventario): Debe agregar un recurso y vincularlo al laboratorio', async () => {
      mockLabRepository.findOne.mockResolvedValue({ lab_id: 1 });

      const dto = {
        name: 'Proyector Epson',
        type: ResourceType.PROJECTOR,
        quantity: 1,
        is_available: true,
      };

      const savedResource = {
        resource_id: 10,
        lab_id: 1,
        ...dto,
      };

      mockResourceRepository.create.mockReturnValue(savedResource);
      mockResourceRepository.save.mockResolvedValue(savedResource);

      const result = await service.create(1, dto);

      expect(mockLabRepository.findOne).toHaveBeenCalledWith({
        where: { lab_id: 1 },
      });
      expect(result.lab_id).toBe(1);
      expect(result.name).toBe('Proyector Epson');
    });

    // CP-10: Este caso no se puede probar a nivel de lógica porque el DTO y la entidad
    // carecen de un enumerador de Status para "En Mantenimiento".
  });
});
