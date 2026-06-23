import { PartialType } from '@nestjs/swagger';
import { CreateCatalogDto } from './create-catalog.dto';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { CatalogItemStatus } from '../entities/catalog.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCatalogDto extends PartialType(CreateCatalogDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional({ enum: CatalogItemStatus })
  @IsEnum(CatalogItemStatus)
  @IsOptional()
  current_status?: CatalogItemStatus;
}
