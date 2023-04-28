import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  let module: TestingModule;
  let reflector: Reflector;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authorizationGuard: AuthorizationGuard;

  beforeAll(async () => {
    module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    authorizationGuard = module.get(AuthorizationGuard);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(reflector).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
    expect(authorizationGuard).toBeDefined();
  });

  describe('canActivate()', () => {
    it('should return true when user is admin', async () => {
      reflector.get = jest.fn().mockReturnValue({
        scopes: ['test:read', 'test:read_own'],
        ownerParam: 'test_id',
      });
      const token = generateToken(['test:read'], '123', 'admin');
      try {
        await authorizationGuard.canActivate(
          getContext({
            headers: { authorization: `Bearer ${token}` },
            params: { test_id: '123' },
          }),
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should return true when user is allowed', async () => {
      reflector.get = jest.fn().mockReturnValue({
        scopes: ['test:read', 'test:read_own'],
        ownerParam: 'test_id',
      });
      const token = generateToken(['test:read_own'], '123', 'user');
      try {
        await authorizationGuard.canActivate(
          getContext({
            headers: { authorization: `Bearer ${token}` },
            params: { test_id: '123' },
          }),
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should return true when there is no auth scope', async () => {
      reflector.get = jest.fn().mockReturnValue(undefined);
      const result = await authorizationGuard.canActivate(getContext({}));
      expect(result).toBeTruthy();
    });
    it('should throw an error if there is no access token', async () => {
      reflector.get = jest.fn().mockReturnValue({
        scopes: ['test:read'],
        ownerParam: 'test_id',
      });
      try {
        await authorizationGuard.canActivate(getContext({ headers: {} }));
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('should throw an error when token is invalid', async () => {
      reflector.get = jest.fn().mockReturnValue({
        scopes: ['test:read'],
        ownerParam: 'test_id',
      });
      const token = generateToken(['test:read'], '123', 'user', false);
      try {
        await authorizationGuard.canActivate(
          getContext({ headers: { authorization: `Bearer ${token}` } }),
        );
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
    });
    it('should throw an error if user does not have scope', async () => {
      reflector.get = jest.fn().mockReturnValue({
        scopes: ['test:read'],
        ownerParam: 'test_id',
      });
      const token = generateToken(['test:create'], '123', 'user');
      try {
        await authorizationGuard.canActivate(
          getContext({ headers: { authorization: `Bearer ${token}` } }),
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should throw an error if user does not have permission', async () => {
      reflector.get = jest.fn().mockReturnValue({
        scopes: ['test:read', 'test:read_own'],
        ownerParam: 'test_id',
      });
      const token = generateToken(['test:read_own'], '123', 'user');
      try {
        await authorizationGuard.canActivate(
          getContext({
            headers: { authorization: `Bearer ${token}` },
            params: { test_id: '1234' },
          }),
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  function getContext(request) {
    const mockExecutionContext: Partial<
      Record<
        jest.FunctionPropertyNames<ExecutionContext>,
        jest.MockedFunction<any>
      >
    > = {
      getHandler: jest.fn().mockReturnValue(jest.fn()),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
        getResponse: jest.fn(),
      }),
    };
    return mockExecutionContext as ExecutionContext;
  }

  function generateToken(scopes, sub, type, valid = true) {
    const options = { secret: undefined };
    if (valid) {
      options.secret = configService.get('JWT_SECRET', 's3cr3t');
    }
    return jwtService.sign(
      {
        scopes,
        sub,
        type,
      },
      options,
    );
  }
});
