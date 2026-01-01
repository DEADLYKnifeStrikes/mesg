import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { ContactsModule } from './contacts/contacts.module';
import { VerificationModule } from './verification/verification.module';
import { UploadsModule } from './uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ChatsModule,
    MessagesModule,
    ContactsModule,
    VerificationModule,
    UploadsModule,
    WebsocketModule,
  ],
})
export class AppModule {}
