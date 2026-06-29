import { Controller, Post, Body, UseInterceptors, UploadedFiles, Get, Param } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5)) // Máximo 5 archivos
  async create(
    @Body() createIncidentDto: CreateIncidentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.incidentsService.create(createIncidentDto, files);
  }

  @Get()
  findAll() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }
}
