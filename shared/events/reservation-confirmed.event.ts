export class ReservationConfirmedEvent {
  readonly eventType = 'ReservationConfirmed';
  readonly version = '1.0';

  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public readonly labId: number,
    public readonly labName: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly confirmedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
