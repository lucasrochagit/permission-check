import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Scope } from './authorization.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authScope = this.reflector.get<Scope>(
      'authScope',
      context.getHandler(),
    );
    if (!authScope) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'An access token is required for this operation',
      );
    }
    const jwtSecret = this.configService.get('JWT_SECRET');
    const {
      scopes: userScopes,
      sub: userId,
      type: userType,
    } = this.validateTokenAndGetPayload(token, jwtSecret);
    const hasScope = userScopes.some((scope) =>
      authScope.scopes.includes(scope),
    );
    if (!hasScope) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      );
    }
    const hasOwnerScope = authScope.scopes.some((scope) =>
      scope.endsWith('own'),
    );
    const hasOwnerParam = Object.keys(request.params).includes(
      authScope.ownerParam,
    );

    if (hasOwnerScope && hasOwnerParam && userType !== 'admin') {
      const isResourceFromOwner =
        request.params[authScope.ownerParam] === userId;
      if (!isResourceFromOwner) {
        throw new ForbiddenException(
          'You are not allowed to perform this operation',
        );
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validateTokenAndGetPayload(token: string, secret: string) {
    try {
      return this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
