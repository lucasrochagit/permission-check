import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

export class AppModuleMock {
  static async module() {
    return Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  }

  static async bootstrap() {
    const module = await this.module();
    return module.createNestApplication();
  }
}
