import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LaboratoriesService } from './laboratories.service';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto';
import { LaboratoryStatus } from './entities/laboratory.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('laboratories')
@Controller('laboratories')
export class LaboratoriesController {
  constructor(private readonly laboratoriesService: LaboratoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear un nuevo laboratorio' })
  @ApiResponse({ status: 201, description: 'Laboratorio creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El laboratorio ya existe' })
  create(
    @Body() createLaboratoryDto: CreateLaboratoryDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.laboratoriesService.create(createLaboratoryDto, currentUser);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de laboratorios' })
  @ApiResponse({ status: 200, description: 'Estadísticas del dashboard' })
  getStats() {
    return this.laboratoriesService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los laboratorios' })
  @ApiQuery({ name: 'status', enum: LaboratoryStatus, required: false })
  @ApiQuery({ name: 'active_only', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Lista de laboratorios' })
  findAll(
    @Query('status') status?: LaboratoryStatus,
    @Query('active_only') active_only?: string,
  ) {
    const filters = {
      status,
      active_only:
        active_only === 'true'
          ? true
          : active_only === 'false'
            ? false
            : undefined,
    };
    return this.laboratoriesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener laboratorio por ID' })
  @ApiResponse({ status: 200, description: 'Laboratorio encontrado' })
  @ApiResponse({ status: 404, description: 'Laboratorio no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.laboratoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Actualizar laboratorio' })
  @ApiResponse({ status: 200, description: 'Laboratorio actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLaboratoryDto: UpdateLaboratoryDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.laboratoriesService.update(
      id,
      updateLaboratoryDto,
      currentUser,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cambiar estado del laboratorio' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: LaboratoryStatus,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.laboratoriesService.toggleStatus(id, status, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar laboratorio (soft delete)' })
  @ApiResponse({ status: 200, description: 'Laboratorio desactivado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.laboratoriesService.remove(id, currentUser);
  }
}
