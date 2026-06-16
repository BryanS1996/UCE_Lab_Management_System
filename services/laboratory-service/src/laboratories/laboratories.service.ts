import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Laboratory, LaboratoryStatus } from './entities/laboratory.entity';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { INITIAL_LABORATORIES } from './laboratories.seed';

export interface LaboratoryFilters {
  status?: LaboratoryStatus;
  active_only?: boolean;
}

export interface CurrentUser {
  user_id: string;
  email: string;
  role: string;
}

@Injectable()
export class LaboratoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Laboratory)
    private readonly labRepository: Repository<Laboratory>,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async onModuleInit() {
    const count = await this.labRepository.count();
    if (count === 0) {
      console.log('🌱 No laboratories found in database. Seeding 50 initial laboratories...');
      for (const labData of INITIAL_LABORATORIES) {
        const lab = this.labRepository.create({
          ...labData,
          created_by: 'system',
          updated_by: 'system',
        });
        await this.labRepository.save(lab);
      }
      console.log('✅ 50 laboratories successfully seeded!');
    }
  }

  async create(
    dto: CreateLaboratoryDto,
    currentUser: CurrentUser,
  ): Promise<Laboratory> {
    const existing = await this.labRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Laboratory with name "${dto.name}" already exists`,
      );
    }

    const lab = this.labRepository.create({
      ...dto,
      created_by: currentUser.email,
      updated_by: currentUser.email,
    });

    const saved = await this.labRepository.save(lab);

    await this.rabbitmqService.publishLaboratoryCreated({
      lab_id: saved.lab_id,
      name: saved.name,
      status: saved.status,
      created_by: saved.created_by,
      created_at: saved.created_at,
    });

    return saved;
  }

  async findAll(filters?: LaboratoryFilters): Promise<Laboratory[]> {
    const query = this.labRepository
      .createQueryBuilder('lab')
      .leftJoinAndSelect('lab.resources', 'resources');

    if (filters?.status) {
      query.andWhere('lab.status = :status', { status: filters.status });
    }

    if (filters?.active_only === true || filters?.active_only === undefined) {
      // Default: show all, active_only=true filters
      if (filters?.active_only === true) {
        query.andWhere('lab.is_active = :isActive', { isActive: true });
      }
    }

    return query.orderBy('lab.created_at', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Laboratory> {
    const lab = await this.labRepository.findOne({
      where: { lab_id: id },
      relations: ['resources'],
    });
    if (!lab) {
      throw new NotFoundException(`Laboratory with ID ${id} not found`);
    }
    return lab;
  }

  async update(
    id: number,
    dto: UpdateLaboratoryDto,
    currentUser: CurrentUser,
  ): Promise<Laboratory> {
    const lab = await this.findOne(id);

    if (dto.name && dto.name !== lab.name) {
      const existing = await this.labRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Laboratory with name "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(lab, dto, { updated_by: currentUser.email });
    const updated = await this.labRepository.save(lab);

    await this.rabbitmqService.publishLaboratoryUpdated({
      lab_id: updated.lab_id,
      name: updated.name,
      status: updated.status,
      updated_by: updated.updated_by,
      updated_at: updated.updated_at,
    });

    return updated;
  }

  async remove(
    id: number,
    currentUser: CurrentUser,
  ): Promise<{ message: string }> {
    const lab = await this.findOne(id);
    lab.is_active = false;
    lab.updated_by = currentUser.email;
    await this.labRepository.save(lab);
    return { message: `Laboratory ${id} has been deactivated` };
  }

  async toggleStatus(
    id: number,
    status: LaboratoryStatus,
    currentUser: CurrentUser,
  ): Promise<Laboratory> {
    const lab = await this.findOne(id);
    lab.status = status;
    lab.updated_by = currentUser.email;
    const updated = await this.labRepository.save(lab);

    await this.rabbitmqService.publishLaboratoryUpdated({
      lab_id: updated.lab_id,
      name: updated.name,
      status: updated.status,
      updated_by: updated.updated_by,
      updated_at: updated.updated_at,
    });

    return updated;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    active_resources: number;
  }> {
    const [total, active, inactive, maintenance, active_resources] =
      await Promise.all([
        this.labRepository.count(),
        this.labRepository.count({
          where: { status: LaboratoryStatus.ACTIVE, is_active: true },
        }),
        this.labRepository.count({
          where: { status: LaboratoryStatus.INACTIVE },
        }),
        this.labRepository.count({
          where: { status: LaboratoryStatus.MAINTENANCE },
        }),
        this.labRepository.count({ where: { is_active: true } }),
      ]);

    return { total, active, inactive, maintenance, active_resources };
  }
}
