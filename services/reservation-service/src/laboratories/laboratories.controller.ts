import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  /**
   * POST /laboratories
   * Crear un nuevo laboratorio (solo ADMIN)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  /**
   * GET /laboratories
   * Obtener todos los laboratorios
   * Query: ?active_only=true
   */
  @Get()
  findAll(@Query('active_only') activeOnly?: string) {
    const isActiveOnly =
      activeOnly !== undefined ? activeOnly === 'true' : undefined;
    return this.laboratoriesService.findAll(isActiveOnly);
  }

  /**
   * GET /laboratories/:id
   * Obtener un laboratorio por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.findOne(id);
  }

  /**
   * GET /laboratories/:id/availability
   * Verificar disponibilidad del laboratorio en un rango de tiempo
   * Query: ?start=ISO_DATE&end=ISO_DATE
   */
  @Get(':id/availability')
  checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return this.laboratoriesService.checkAvailability(id, startTime, endTime);
  }

  /**
   * PATCH /laboratories/:id
   * Actualizar un laboratorio (solo ADMIN)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLaboratoryDto: UpdateLaboratoryDto,
  ) {
    return this.laboratoriesService.update(id, updateLaboratoryDto);
  }

  /**
   * PATCH /laboratories/:id/toggle
   * Activar o desactivar un laboratorio (solo ADMIN)
   */
  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.toggleActive(id);
  }

  /**
   * DELETE /laboratories/:id
   * Eliminar un laboratorio (solo ADMIN)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.remove(id);
  }
}
