import { Controller, Get, Post, Patch, Delete, Param, Body, Headers } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('api/reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('my')
  getMyReservations(@Headers('authorization') authHeader: string) {
    return this.reservationService.getMyReservations(authHeader);
  }

  @Get(':id')
  getReservation(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.reservationService.getReservation(authHeader, id);
  }

  @Post()
  createReservation(@Headers('authorization') authHeader: string, @Body() createDto: any) {
    return this.reservationService.createReservation(authHeader, createDto);
  }

  @Patch(':id')
  updateReservation(@Headers('authorization') authHeader: string, @Param('id') id: string, @Body() updateDto: any) {
    return this.reservationService.updateReservation(authHeader, id, updateDto);
  }

  @Delete(':id')
  cancelReservation(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.reservationService.cancelReservation(authHeader, id);
  }
}
