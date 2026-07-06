import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Headers('authorization') authHeader: string) {
    return this.usersService.findAll(authHeader);
  }

  @Post()
  create(
    @Headers('authorization') authHeader: string,
    @Body() createUserDto: any,
  ) {
    return this.usersService.create(authHeader, createUserDto);
  }

  @Patch(':id/role')
  updateRole(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.usersService.updateRole(authHeader, id, role);
  }

  @Patch(':id/status')
  updateStatus(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.updateStatus(authHeader, id, isActive);
  }

  @Delete(':id')
  deleteUser(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(authHeader, id);
  }
}
