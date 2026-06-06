import { PartialType } from '@nestjs/mapped-types';
import { CreateLaboratoryDto } from './create-laboratory.dto';

export class UpdateLaboratoryDto extends PartialType(CreateLaboratoryDto) {}
