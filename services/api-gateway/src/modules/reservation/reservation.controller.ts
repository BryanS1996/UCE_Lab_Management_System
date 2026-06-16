import { Controller, Get, Post, Patch, Delete, Param, Body, Headers, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller('api/reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  getAllReservations(
    @Headers('authorization') authHeader: string,
    @Query() query: any,
  ) {
    return this.reservationService.getAllReservations(authHeader, query);
  }

  @Get('my')
  getMyReservations(@Headers('authorization') authHeader: string) {
    return this.reservationService.getMyReservations(authHeader);
  }

  @Get('admin/stats')
  getAdminStats(@Headers('authorization') authHeader: string) {
    return this.reservationService.getAdminStats(authHeader);
  }

  @Get(':id')
  getReservation(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.reservationService.getReservation(authHeader, id);
  }

  @Post()
  createReservation(@Headers('authorization') authHeader: string, @Body() createDto: any) {
    return this.reservationService.createReservation(authHeader, createDto);
  }

  @Patch(':id/confirm')
  confirmReservation(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.reservationService.confirmReservation(authHeader, id);
  }

  @Patch(':id/reject')
  rejectReservation(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    return this.reservationService.rejectReservation(authHeader, id);
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
