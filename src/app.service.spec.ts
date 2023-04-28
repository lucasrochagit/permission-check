import { TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { AppModuleMock } from '../test/mock/app.module.mock';

describe('AppService', () => {
  let module: TestingModule;
  let service: AppService;

  beforeAll(async () => {
    module = await AppModuleMock.module();
    service = module.get<AppService>(AppService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello()', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });
});
