import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('resources')
@Controller('laboratories/:labId/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Agregar recurso a un laboratorio' })
  @ApiResponse({ status: 201, description: 'Recurso creado' })
  create(
    @Param('labId', ParseIntPipe) labId: number,
    @Body() createResourceDto: CreateResourceDto,
  ) {
    return this.resourcesService.create(labId, createResourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar recursos de un laboratorio' })
  @ApiResponse({ status: 200, description: 'Lista de recursos' })
  findAll(@Param('labId', ParseIntPipe) labId: number) {
    return this.resourcesService.findAllByLab(labId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Actualizar recurso' })
  @ApiResponse({ status: 200, description: 'Recurso actualizado' })
  update(
    @Param('labId', ParseIntPipe) labId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(labId, id, updateResourceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar recurso' })
  @ApiResponse({ status: 200, description: 'Recurso eliminado' })
  remove(
    @Param('labId', ParseIntPipe) labId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.resourcesService.remove(labId, id);
  }
}
