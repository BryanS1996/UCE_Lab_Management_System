import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { CatalogItem, CatalogItemStatus } from './entities/catalog.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CatalogItem)
    private catalogRepository: Repository<CatalogItem>,
  ) {}

  async create(createCatalogDto: CreateCatalogDto) {
    const item = this.catalogRepository.create(createCatalogDto);
    return await this.catalogRepository.save(item);
  }

  async findAllPublic() {
    return await this.catalogRepository.find({
      where: { is_published: true },
    });
  }

  async findAllAdmin() {
    return await this.catalogRepository.find();
  }

  async findOne(id: number) {
    const item = await this.catalogRepository.findOne({
      where: { laboratory_id: id },
    });
    if (!item)
      throw new NotFoundException(
        `Laboratorio ${id} no encontrado en el catálogo`,
      );
    return item;
  }

  async update(id: number, updateCatalogDto: UpdateCatalogDto) {
    const item = await this.findOne(id);
    Object.assign(item, updateCatalogDto);
    return await this.catalogRepository.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.catalogRepository.remove(item);
  }

  async updateStatus(laboratory_id: number, status: CatalogItemStatus) {
    await this.catalogRepository.update(
      { laboratory_id },
      { current_status: status },
    );
  }
}
