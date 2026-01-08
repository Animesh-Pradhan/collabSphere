import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { gateTokenExtractor } from 'src/utils/helper';
import { GatePayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({ jwtFromRequest: gateTokenExtractor, secretOrKey: config.get<string>('JWT_SECRET') });
    }

    validate(payload: GatePayload) {
        return payload;
    }
}
