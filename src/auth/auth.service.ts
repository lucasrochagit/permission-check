import { Injectable } from '@nestjs/common';
import { AuthDto } from './auth.dto';
import { getId } from 'json-generator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(body: AuthDto) {
    const payload = {
      sub: body.id || getId('objectId'),
      type: body.type,
      scopes: this.getUserScopes(body.type),
    };

    return {
      ...payload,
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
    };
  }

  getUserScopes(type: string) {
    return {
      user: ['user:read_own', 'user:update_own', 'user:delete_own'],
      admin: ['user:read', 'user:update', 'user:delete'],
    }[type];
  }
}
