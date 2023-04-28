import { TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModuleMock } from '../../test/mock/auth.module.mock';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';

describe('AuthController', () => {
  let module: TestingModule;
  let controller: AuthController;
  let service: AuthService;

  beforeAll(async () => {
    module = await AuthModuleMock.module();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('auth()', () => {
    it('should return the auth info for user type', async () => {
      const result = await controller.auth({ type: 'user' } as AuthDto);
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('type', 'user');
      expect(result).toHaveProperty('scopes', service.getUserScopes('user'));
      expect(result).toHaveProperty('access_token');
    });
    it('should return the auth info for admin type', async () => {
      const result = await controller.auth({ type: 'admin' } as AuthDto);
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('type', 'admin');
      expect(result).toHaveProperty('scopes', service.getUserScopes('admin'));
      expect(result).toHaveProperty('access_token');
    });
  });
});
