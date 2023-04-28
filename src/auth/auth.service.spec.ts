import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthModuleMock } from '../../test/mock/auth.module.mock';
import { AuthDto } from './auth.dto';

describe('AuthService', () => {
  let module: TestingModule;
  let service: AuthService;

  beforeAll(async () => {
    module = await AuthModuleMock.module();
    service = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn()', () => {
    it('should return the auth info', async () => {
      const result = await service.signIn({ type: 'user' } as AuthDto);
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('type', 'user');
      expect(result).toHaveProperty('scopes', service.getUserScopes('user'));
      expect(result).toHaveProperty('access_token');
    });
    it('should return the auth info for admin type', async () => {
      const result = await service.signIn({ type: 'admin' } as AuthDto);
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('type', 'admin');
      expect(result).toHaveProperty('scopes', service.getUserScopes('admin'));
      expect(result).toHaveProperty('access_token');
    });
  });
});
