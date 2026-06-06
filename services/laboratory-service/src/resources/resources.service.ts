import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../laboratories/entities/resource.entity';
import { Laboratory } from '../laboratories/entities/laboratory.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(Laboratory)
    private readonly labRepository: Repository<Laboratory>,
  ) {}

  private async checkLabExists(labId: number): Promise<Laboratory> {
    const lab = await this.labRepository.findOne({ where: { lab_id: labId } });
    if (!lab) {
      throw new NotFoundException(`Laboratory with ID ${labId} not found`);
    }
    return lab;
  }

  async create(labId: number, dto: CreateResourceDto): Promise<Resource> {
    await this.checkLabExists(labId);
    const resource = this.resourceRepository.create({ ...dto, lab_id: labId });
    return this.resourceRepository.save(resource);
  }

  async findAllByLab(labId: number): Promise<Resource[]> {
    await this.checkLabExists(labId);
    return this.resourceRepository.find({
      where: { lab_id: labId },
      order: { created_at: 'DESC' },
    });
  }

  async update(labId: number, resourceId: number, dto: UpdateResourceDto): Promise<Resource> {
    await this.checkLabExists(labId);
    const resource = await this.resourceRepository.findOne({
      where: { resource_id: resourceId, lab_id: labId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found in lab ${labId}`);
    }
    Object.assign(resource, dto);
    return this.resourceRepository.save(resource);
  }

  async remove(labId: number, resourceId: number): Promise<{ message: string }> {
    await this.checkLabExists(labId);
    const resource = await this.resourceRepository.findOne({
      where: { resource_id: resourceId, lab_id: labId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found in lab ${labId}`);
    }
    await this.resourceRepository.remove(resource);
    return { message: `Resource ${resourceId} deleted from lab ${labId}` };
  }
}
