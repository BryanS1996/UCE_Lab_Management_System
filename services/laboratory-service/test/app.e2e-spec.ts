import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
// En un escenario real importarías AppModule: import { AppModule } from './../src/app.module';

// Simularemos los módulos temporalmente para aislar la prueba E2E
// Omitiendo la conexión a base de datos real.

describe('Laboratory & Resources (e2e)', () => {
  let app: INestApplication;

  // Mocks de los servicios
  const mockLaboratoriesService = {
    create: jest.fn(),
  };

  const mockResourcesService = {
    create: jest.fn(),
  };

  beforeAll(async () => {
    // Si tuviéramos los controladores montados directamente en AppModule:
    /*
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(LaboratoriesService).useValue(mockLaboratoriesService)
    .overrideProvider(ResourcesService).useValue(mockResourcesService)
    .compile();
    */

    // Como estamos enfocados en generar los scripts para cuando estén listos
    // dejaremos este esqueleto E2E estructurado.
    
    // app = moduleFixture.createNestApplication();
    // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    // await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /laboratories', () => {
    it.skip('CP-07 (Happy Path): Creación de un laboratorio nuevo', async () => {
      mockLaboratoriesService.create.mockResolvedValue({
        lab_id: 1,
        name: 'Lab E2E',
        max_capacity: 45,
      });

      return request(app.getHttpServer())
        .post('/laboratories')
        .send({
          name: 'Lab E2E',
          max_capacity: 45,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.max_capacity).toBe(45);
        });
    });

    it.skip('CP-08 (Negativo - Validación DTO): max_capacity inválido lanza 400', async () => {
      return request(app.getHttpServer())
        .post('/laboratories')
        .send({
          name: 'Lab Inválido',
          max_capacity: -5, // Valor negativo, el DTO usa @Min(1)
        })
        .expect(400); // BadRequestException lanzada por ValidationPipe
    });
  });

  describe('POST /laboratories/:lab_id/resources', () => {
    it.skip('CP-09 (Happy Path): Agregar un recurso a un laboratorio existente', async () => {
      mockResourcesService.create.mockResolvedValue({
        resource_id: 10,
        lab_id: 1,
        name: 'Proyector',
        quantity: 1,
      });

      return request(app.getHttpServer())
        .post('/laboratories/1/resources')
        .send({
          name: 'Proyector',
          quantity: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.lab_id).toBe(1);
        });
    });

    // CP-10: Este caso está omitido temporalmente porque la entidad Resource no soporta estados como "En Mantenimiento"
  });
});
