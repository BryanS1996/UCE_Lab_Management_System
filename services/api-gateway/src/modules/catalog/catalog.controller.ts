import { Controller, Get, Post, Patch, Delete, Param, Body, Headers } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('api/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  getPublicCatalog() {
    return this.catalogService.getPublicCatalog();
  }

  @Get('admin/all')
  getAdminCatalog(@Headers('authorization') authHeader: string) {
    return this.catalogService.getAdminCatalog(authHeader);
  }

  @Get(':id')
  getCatalogItem(@Param('id') id: string) {
    return this.catalogService.getCatalogItem(id);
  }

  @Post()
  createCatalogItem(@Headers('authorization') authHeader: string, @Body() createDto: any) {
    return this.catalogService.createCatalogItem(authHeader, createDto);
  }

  @Patch(':id')
  updateCatalogItem(@Headers('authorization') authHeader: string, @Param('id') id: string, @Body() updateDto: any) {
    return this.catalogService.updateCatalogItem(authHeader, id, updateDto);
  }

  @Delete(':id')
  deleteCatalogItem(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.catalogService.deleteCatalogItem(authHeader, id);
  }
}
