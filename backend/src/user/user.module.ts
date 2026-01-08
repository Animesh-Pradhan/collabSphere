import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { AuditModule } from 'src/common/audit/audit.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule, AuditModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
