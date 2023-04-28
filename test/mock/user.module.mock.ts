import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ValidationPipe } from '@nestjs/common';
import { UserController } from '../../src/user/user.controller';
import { UserService } from '../../src/user/user.service';

export class UserModuleMock {
  static async module() {
    return Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        JwtModule.register({
          global: true,
          secret: 's3cr3t',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      controllers: [UserController],
      providers: [UserService],
    }).compile();
  }

  static async bootstrap() {
    const module = await this.module();
    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    return app;
  }
}
