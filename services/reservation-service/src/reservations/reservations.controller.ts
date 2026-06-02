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
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto } from './dto';
import { ReservationStatus } from '../database/entities';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * POST /reservations
   * Crear una nueva reserva
   * Body: CreateReservationDto
   * Returns: Reservation creada
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  /**
   * GET /reservations
   * Obtener todas las reservas con filtros opcionales
   * Query params:
   *   - laboratory_id (UUID)
   *   - user_id (UUID)
   *   - status (PENDING | CONFIRMED | CANCELLED)
   */
  @Get()
  findAll(
    @Query('laboratory_id') laboratory_id?: string,
    @Query('user_id') user_id?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findAll({
      laboratory_id,
      user_id,
      status,
    });
  }

  /**
   * GET /reservations/:id
   * Obtener una reserva específica por ID
   * Params:
   *   - id (UUID de la reserva)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  /**
   * PATCH /reservations/:id
   * Actualizar una reserva
   * Params:
   *   - id (UUID de la reserva)
   * Body: UpdateReservationDto (campos opcionales)
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  /**
   * DELETE /reservations/:id
   * Cancelar una reserva (soft delete)
   * Params:
   *   - id (UUID de la reserva)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }

  /**
   * PATCH /reservations/:id/confirm
   * Confirmar una reserva (cambiar estado PENDING → CONFIRMED)
   * Params:
   *   - id (UUID de la reserva)
   */
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }
}
