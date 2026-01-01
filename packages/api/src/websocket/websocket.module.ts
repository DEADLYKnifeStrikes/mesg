import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketGateway } from './websocket.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
    MessagesModule,
  ],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
