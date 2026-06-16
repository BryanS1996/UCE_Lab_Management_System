import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto } from './dto';
import { ReservationStatus } from '../database/entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('reservations')
@ApiBearerAuth('JWT')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear reserva',
    description: 'Crea una nueva reserva de laboratorio. El user_id se toma automáticamente del JWT. Verifica disponibilidad del laboratorio y conflictos de horario. Publica evento ReservationCreated en RabbitMQ.',
  })
  @ApiResponse({ status: 201, description: 'Reserva creada con estado PENDING.' })
  @ApiResponse({ status: 400, description: 'Fechas inválidas o laboratorio no activo.' })
  @ApiResponse({ status: 401, description: 'Token JWT inválido o expirado.' })
  @ApiResponse({ status: 409, description: 'Conflicto de horario en el laboratorio.' })
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.create(createReservationDto, currentUser);
  }

  @Get('my')
  @ApiOperation({ summary: 'Mis reservas', description: 'Retorna todas las reservas del usuario autenticado.' })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus, description: 'Filtrar por estado' })
  @ApiResponse({ status: 200, description: 'Lista de reservas del usuario.' })
  findMyReservations(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findMyReservations(currentUser, status);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar reservas',
    description: 'ADMIN: retorna todas las reservas. Otros roles: solo sus propias reservas.',
  })
  @ApiQuery({ name: 'lab_id', required: false, type: Number })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Solo disponible para ADMIN' })
  @ApiQuery({ name: 'status', required: false, enum: ReservationStatus })
  @ApiResponse({ status: 200, description: 'Lista de reservas.' })
  findAll(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('lab_id') lab_id?: string,
    @Query('user_id') user_id?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findAll(
      { lab_id: lab_id ? parseInt(lab_id, 10) : undefined, user_id, status },
      currentUser,
    );
  }

  @Get('admin/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas administrativas',
    description: 'ADMIN: Retorna estadísticas de reservas por período (día/semana/mes), top 3 usuarios y top 5 laboratorios.',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido.' })
  getAdminStats(@CurrentUser() currentUser: CurrentUserData) {
    return this.reservationsService.getAdminStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reserva por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID de la reserva' })
  @ApiResponse({ status: 200, description: 'Datos de la reserva.' })
  @ApiResponse({ status: 403, description: 'Sin permiso para ver esta reserva.' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar reserva', description: 'Actualiza campos de una reserva. Solo el dueño o ADMIN.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Reserva actualizada.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.update(id, updateReservationDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar reserva', description: 'Cancela una reserva (soft delete → estado CANCELLED). Publica evento ReservationCancelled en RabbitMQ.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Reserva cancelada.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.remove(id, currentUser);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar reserva', description: 'Cambia estado de PENDING → CONFIRMED. Solo ADMIN. Publica evento ReservationConfirmed en RabbitMQ.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Reserva confirmada.' })
  @ApiResponse({ status: 400, description: 'La reserva no está en estado PENDING.' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.confirm(id, currentUser);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar reserva', description: 'Cambia estado de PENDING → CANCELLED (Rechazada). Solo ADMIN. Publica evento ReservationCancelled en RabbitMQ.' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Reserva rechazada.' })
  @ApiResponse({ status: 400, description: 'La reserva no está en estado PENDING.' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.reject(id, currentUser);
  }
}
