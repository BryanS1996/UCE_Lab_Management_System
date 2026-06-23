import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

/**
 * Registra un ClientProxy MQTT para que el catalog-service
 * pueda publicar mensajes ligeros de sistema en el broker Mosquitto.
 * Token de inyección: 'MQTT_CLIENT'
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: process.env.MQTT_URL || 'mqtt://localhost:1883',
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MqttPublisherModule {}
