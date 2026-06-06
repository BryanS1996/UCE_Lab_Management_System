export class ReservationCancelledEvent {
  readonly eventType = 'ReservationCancelled';
  readonly version = '1.0';

  constructor(
    public readonly reservationId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public readonly labId: number,
    public readonly reason?: string,
    public readonly cancelledBy?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
