import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { ValidationPipe } from '@nestjs/common';

export class AuthModuleMock {
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
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();
  }

  static async bootstrap() {
    const module = await this.module();
    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    return app;
  }
}
