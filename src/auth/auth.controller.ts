import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async auth(@Body() body: AuthDto) {
    return this.service.signIn(body);
  }
}
