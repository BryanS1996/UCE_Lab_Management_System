import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  constructor(private readonly configService: ConfigService) {
    
    // Configuración para LocalStack si estamos en desarrollo local
    const endpoint = this.configService.get<string>('AWS_ENDPOINT') || 'http://localhost:4566';
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    this.s3Client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true, // Requerido para LocalStack
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || 'test',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || 'test',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, bucket: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // LocalStack can complain about ACL sometimes if not configured
      });

      await this.s3Client.send(command);

      const endpoint = this.configService.get<string>('AWS_ENDPOINT') || 'http://localhost:4566';
      return `${endpoint}/${bucket}/${fileName}`;
    } catch (error) {
      this.logger.error(`Error uploading file to S3: ${(error as Error).message}`);
      throw error;
    }
  }
}
