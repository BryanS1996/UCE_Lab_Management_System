import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';

describe('AppController', () => {
  let appController: AppController;
  let rabbitmqServiceMock: Partial<RabbitmqService>;

  beforeEach(async () => {
    rabbitmqServiceMock = {
      publishLaboratoryAlert: jest.fn().mockResolvedValue(undefined),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: RabbitmqService, useValue: rabbitmqServiceMock },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
