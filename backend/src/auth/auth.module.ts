import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthUserController } from './user/auth-user.controller'
import { AuthUserService } from './user/auth-user.service';
import { UserService } from 'src/user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthAdminController } from './admin/auth-admin.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: Number(config.get<string>('GATE_TTL')) || 90000
                },
            }),
        }),
        PrismaModule,
        MailModule
    ],
    controllers: [AuthUserController, AuthAdminController],
    providers: [AuthService, AuthUserService, UserService, JwtStrategy],
    exports: [AuthService, JwtModule, AuthUserService],
})
export class AuthModule { }
