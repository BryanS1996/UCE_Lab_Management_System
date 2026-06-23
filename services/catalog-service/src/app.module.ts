import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from './catalog/catalog.module';
import { CommonModule } from './common/common.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { ConsumersModule } from './consumers/consumers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5436', 10),
      username: process.env.DB_USERNAME || 'cataloguser',
      password: process.env.DB_PASSWORD || 'catalogpassword',
      database: process.env.DB_NAME || 'catalog_service',
      autoLoadEntities: true,
      synchronize: true, // TRUE solo en local/QA para que cree las tablas automáticamente
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    CommonModule,
    CatalogModule,
    RabbitmqModule,
    ConsumersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
