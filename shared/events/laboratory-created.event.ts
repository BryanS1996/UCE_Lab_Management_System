export class LaboratoryCreatedEvent {
  readonly eventType = 'LaboratoryCreated';
  readonly version = '1.0';

  constructor(
    public readonly labId: number,
    public readonly name: string,
    public readonly location: string,
    public readonly maxCapacity: number,
    public readonly createdBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
