import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../database/entities';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should persist a user', async () => {
    const dto = {
      email: 'new@uce.edu.ec',
      firstName: 'Ana',
      lastName: 'López',
      password: 'hashed',
    };
    const created = { id: 'uuid', ...dto };
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    await expect(service.create(dto)).resolves.toEqual(created);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  it('findById should query by primary key', async () => {
    const user = { id: 'uuid', email: 'a@b.com' };
    mockRepository.findOne.mockResolvedValue(user);

    await expect(service.findById('uuid')).resolves.toEqual(user);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'uuid' },
      relations: ['roles'],
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  });
});
