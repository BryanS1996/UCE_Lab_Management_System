import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IncidentDocument = Incident & Document;

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true })
export class Incident {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true })
  lab_id: number;

  @Prop({ required: true })
  reservation_id: string;

  @Prop({ type: String, enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Prop({ type: [String], default: [] })
  evidence_urls: string[];
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
