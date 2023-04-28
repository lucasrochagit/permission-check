import { TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppModuleMock } from '../test/mock/app.module.mock';

describe('AppController', () => {
  let module: TestingModule;
  let controller: AppController;

  beforeAll(async () => {
    module = await AppModuleMock.module();
    controller = module.get<AppController>(AppController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHello()', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });
  });
});
