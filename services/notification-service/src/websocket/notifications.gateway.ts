import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.checkToken(client);
  }

  private checkToken(client: Socket): boolean {
    const token =
      (client.handshake.auth?.token as string | undefined) ||
      (client.handshake.headers?.authorization
        ? client.handshake.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        ) as JwtPayload;
        if (payload && payload.exp) {
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            this.logger.log(`Token expired for client ${client.id}`);
            client.emit('token_expired', { message: 'Tu sesión ha expirado' });
            client.disconnect();
            return false;
          }
        }
      } catch (e) {
        this.logger.error('Error parsing JWT', e);
      }
    }
    return true;
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Limpiar el mapa
    for (const [userId, socketId] of this.connectedUsers) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    if (!this.checkToken(client)) return;
    this.connectedUsers.set(userId, client.id);
    this.logger.log(`User ${userId} registered with socket ${client.id}`);
    client.emit('registered', { success: true, userId });
  }

  // Método para emitir notificación a un usuario específico
  emitToUser(userId: string, event: string, data: unknown) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
      this.logger.log(`Emitted '${event}' to user ${userId}`);
    }
  }

  // Método para broadcast
  broadcast(event: string, data: unknown) {
    this.server.emit(event, data);
  }
}
