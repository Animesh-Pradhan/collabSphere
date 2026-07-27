import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { SessionInterceptor } from './auth/session.interceptor';
import { OrganisationModule } from './organisation/organisation.module';
import { UploadModule } from './common/upload/upload.module';
import { AuditModule } from './common/audit/audit.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DocumentModule } from './document/document.module';
import { StorageModule } from './storage/storage.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "uploads"),
      serveRoot: "/uploads",
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 5 },
        { name: 'medium', ttl: 10000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 300 },
        { name: 'auth', ttl: 60000, limit: 10 },
      ],
      ignoreUserAgents: [/curl/i],
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    MyLoggerModule,
    OrganisationModule,
    UploadModule,
    AuditModule,
    WorkspaceModule,
    DocumentModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService, SessionInterceptor, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  }],
})
export class AppModule { }
