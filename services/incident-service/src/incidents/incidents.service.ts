import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Incident, IncidentDocument } from './schemas/incident.schema';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { S3Service } from '../s3/s3.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

interface ReservationInfo {
  user_id: string;
  lab_id: number;
}

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);
  private readonly reservationServiceUrl: string;

  constructor(
    @InjectModel(Incident.name) private incidentModel: Model<IncidentDocument>,
    private readonly s3Service: S3Service,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Apuntamos al api-gateway o directamente al reservation-service.
    // Usualmente a través de DNS interno en docker o un config.
    this.reservationServiceUrl =
      this.configService.get<string>('RESERVATION_SERVICE_URL') ||
      'http://localhost:3003';
  }

  async create(
    createIncidentDto: CreateIncidentDto,
    files: Express.Multer.File[],
    authHeader: string = '',
  ): Promise<Incident> {
    const { user_id, reservation_id, lab_id } = createIncidentDto;

    // 1. Validar que la reserva existe y pertenece al usuario, y es del mismo lab
    try {
      const response = await firstValueFrom(
        this.httpService.get<ReservationInfo>(
          `${this.reservationServiceUrl}/reservations/${reservation_id}`,
          { headers: { Authorization: authHeader } }
        ),
      );
      const reservation = response.data;

      if (!reservation) {
        throw new NotFoundException('Reserva no encontrada');
      }

      if (reservation.user_id !== user_id) {
        throw new BadRequestException('El usuario no es dueño de la reserva');
      }

      if (reservation.lab_id !== Number(lab_id)) {
        throw new BadRequestException(
          'La reserva no corresponde al laboratorio indicado',
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error validando reserva: ${error.message}`);
      } else {
        this.logger.error('Error validando reserva');
      }
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error al validar la reserva (posiblemente no exista)',
      );
    }

    // 2. Subir evidencias a S3
    const evidenceUrls: string[] = [];
    if (files && files.length > 0) {
      const bucket =
        this.configService.get<string>('AWS_S3_BUCKET') || 'incidents-bucket';
      for (const file of files) {
        const url = await this.s3Service.uploadFile(file, bucket);
        evidenceUrls.push(url);
      }
    }

    // 3. Crear el incidente
    const createdIncident = new this.incidentModel({
      ...createIncidentDto,
      evidence_urls: evidenceUrls,
    });

    return createdIncident.save();
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentModel.find().exec();
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentModel.findById(id).exec();
    if (!incident) {
      throw new NotFoundException(`Incidente #${id} no encontrado`);
    }
    return incident;
  }
}
