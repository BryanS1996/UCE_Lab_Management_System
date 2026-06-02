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
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('laboratories')
@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear laboratorio', description: 'Crea un nuevo laboratorio. Requiere autenticación.' })
  @ApiResponse({ status: 201, description: 'Laboratorio creado exitosamente.' })
  @ApiResponse({ status: 409, description: 'Ya existe un laboratorio con ese nombre.' })
  create(@Body() createLaboratoryDto: CreateLaboratoryDto) {
    return this.laboratoriesService.create(createLaboratoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar laboratorios', description: 'Retorna todos los laboratorios. Puede filtrarse por estado activo.' })
  @ApiQuery({ name: 'active_only', required: false, type: Boolean, description: 'Si es true, solo retorna laboratorios activos.' })
  @ApiResponse({ status: 200, description: 'Lista de laboratorios.' })
  findAll(@Query('active_only') activeOnly?: string) {
    const isActiveOnly = activeOnly !== undefined ? activeOnly === 'true' : undefined;
    return this.laboratoriesService.findAll(isActiveOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener laboratorio por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del laboratorio' })
  @ApiResponse({ status: 200, description: 'Datos del laboratorio.' })
  @ApiResponse({ status: 404, description: 'Laboratorio no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.findOne(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Verificar disponibilidad', description: 'Verifica si el laboratorio está disponible en el rango de tiempo especificado.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del laboratorio' })
  @ApiQuery({ name: 'start', required: true, type: String, example: '2026-06-15T09:00:00Z', description: 'Fecha/hora de inicio (ISO 8601)' })
  @ApiQuery({ name: 'end', required: true, type: String, example: '2026-06-15T11:00:00Z', description: 'Fecha/hora de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Resultado de disponibilidad.' })
  checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.laboratoriesService.checkAvailability(id, new Date(start), new Date(end));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Actualizar laboratorio', description: 'Actualiza los datos de un laboratorio existente.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Laboratorio actualizado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLaboratoryDto: UpdateLaboratoryDto,
  ) {
    return this.laboratoriesService.update(id, updateLaboratoryDto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Activar/Desactivar laboratorio', description: 'Alterna el estado activo del laboratorio.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Estado del laboratorio actualizado.' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar laboratorio' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Laboratorio eliminado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.remove(id);
  }
}
