import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
// Supongamos que importamos el AppModule (ajusta la ruta según tu proyecto)
// import { AppModule } from './../src/app.module';

/**
 * NOTA: Este es un archivo borrador para Pruebas E2E según lo solicitado.
 * En un entorno real de NestJS, deberías importar tu AppModule real o 
 * crear un módulo de pruebas que incluya los Controladores y Servicios
 * mockeando la base de datos (TypeORM) y RabbitMQ.
 */

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  
  // Mock del Guard de JWT para simular usuarios autenticados
  const mockJwtGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = {
        user_id: 'teacher-uuid-123',
        email: 'profesor@uce.edu.ec',
        role: 'TEACHER',
      };
      return true; // Simula que el token es válido
    },
  };

  // Mocks de los repositorios y servicios externos (TypeORM, RabbitMQ) para E2E aislado
  const mockReservationsService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // imports: [AppModule], // Descomentar en entorno real y mockear dependencias
      providers: [],
    })
      // Si tienes un JwtAuthGuard global o en el controlador, lo sobrescribimos:
      // .overrideGuard(JwtAuthGuard).useValue(mockJwtGuard)
      // O si preferimos mockear todo el servicio:
      // .overrideProvider(ReservationsService).useValue(mockReservationsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // Simulamos datos comunes
  const getFutureDate = (hoursToAdd: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hoursToAdd);
    return date.toISOString();
  };

  describe('POST /reservations', () => {
    it('CP-01 (Happy Path): Reserva exitosa por un Docente con >24h de anticipación', async () => {
      // Mock de respuesta exitosa
      mockReservationsService.create.mockResolvedValue({
        reservation_id: 'uuid-123',
        lab_id: 1,
        status: 'PENDING',
      });

      return request(app.getHttpServer())
        .post('/reservations')
        .send({
          lab_id: 1,
          start_time: getFutureDate(48), // > 24h
          end_time: getFutureDate(50),
          purpose: 'Clase Práctica E2E',
          attendees: 20,
        })
        .expect(201); // Created
        // .expect((res) => {
        //   expect(res.body.status).toBe('PENDING');
        // });
    });

    it('CP-02 (Negativo): Intento de reserva con <24h de anticipación', async () => {
      return request(app.getHttpServer())
        .post('/reservations')
        .send({
          lab_id: 1,
          start_time: getFutureDate(10), // < 24h
          end_time: getFutureDate(12),
          purpose: 'Clase de última hora',
        })
        .expect(400); // BadRequest
    });

    it('CP-03 (Negativo): Intento de reserva superando el aforo máximo', async () => {
      return request(app.getHttpServer())
        .post('/reservations')
        .send({
          lab_id: 1,
          start_time: getFutureDate(48),
          end_time: getFutureDate(50),
          purpose: 'Conferencia masiva',
          attendees: 100, // Supera el aforo del lab mockeado
        })
        .expect(400); // BadRequest
    });
  });
});
