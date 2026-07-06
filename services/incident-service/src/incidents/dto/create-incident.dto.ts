export class CreateIncidentDto {
  title: string;
  description: string;
  user_id: string; // En la vida real podría venir del token JWT, pero por simplicidad se pide
  lab_id: number;
  reservation_id: string;
  resource_id?: number; // Opcional por retrocompatibilidad con registros viejos
}
