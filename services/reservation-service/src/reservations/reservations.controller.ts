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
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto } from './dto';
import { ReservationStatus } from '../database/entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('reservations')
@UseGuards(JwtAuthGuard) // Todos los endpoints requieren autenticación
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * POST /reservations
   * Crear una nueva reserva
   * user_id se toma del JWT, no del body
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.create(createReservationDto, currentUser);
  }

  /**
   * GET /reservations/my
   * Obtener mis reservas (usuario autenticado)
   * Query: ?status=PENDING|CONFIRMED|CANCELLED
   */
  @Get('my')
  findMyReservations(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findMyReservations(currentUser, status);
  }

  /**
   * GET /reservations
   * Obtener todas las reservas (admins ven todas, usuarios solo las suyas)
   * Query params:
   *   - lab_id (int)
   *   - user_id (UUID) — solo para admins
   *   - status (PENDING | CONFIRMED | CANCELLED)
   */
  @Get()
  findAll(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('lab_id') lab_id?: string,
    @Query('user_id') user_id?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findAll(
      {
        lab_id: lab_id ? parseInt(lab_id, 10) : undefined,
        user_id,
        status,
      },
      currentUser,
    );
  }

  /**
   * GET /reservations/:id
   * Obtener una reserva específica por ID
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.findOne(id, currentUser);
  }

  /**
   * PATCH /reservations/:id
   * Actualizar una reserva (solo dueño o admin)
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.update(id, updateReservationDto, currentUser);
  }

  /**
   * DELETE /reservations/:id
   * Cancelar una reserva (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.remove(id, currentUser);
  }

  /**
   * PATCH /reservations/:id/confirm
   * Confirmar una reserva: PENDING → CONFIRMED (solo ADMIN)
   */
  @Patch(':id/confirm')
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.reservationsService.confirm(id, currentUser);
  }
}
