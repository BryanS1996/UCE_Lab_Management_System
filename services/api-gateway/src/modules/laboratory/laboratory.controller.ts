import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  Query,
} from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';

@Controller('api/laboratories')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Get()
  getLaboratories(
    @Headers('authorization') authHeader: string,
    @Query() query: any,
  ) {
    return this.laboratoryService.getLaboratories(authHeader, query);
  }

  @Get(':lab_id')
  getLaboratory(
    @Headers('authorization') authHeader: string,
    @Param('lab_id') lab_id: string,
  ) {
    return this.laboratoryService.getLaboratory(authHeader, lab_id);
  }

  @Post()
  createLaboratory(
    @Headers('authorization') authHeader: string,
    @Body() createDto: any,
  ) {
    return this.laboratoryService.createLaboratory(authHeader, createDto);
  }

  @Patch(':lab_id')
  updateLaboratory(
    @Headers('authorization') authHeader: string,
    @Param('lab_id') lab_id: string,
    @Body() updateDto: any,
  ) {
    return this.laboratoryService.updateLaboratory(
      authHeader,
      lab_id,
      updateDto,
    );
  }

  @Delete(':lab_id')
  deleteLaboratory(
    @Headers('authorization') authHeader: string,
    @Param('lab_id') lab_id: string,
  ) {
    return this.laboratoryService.deleteLaboratory(authHeader, lab_id);
  }
}
