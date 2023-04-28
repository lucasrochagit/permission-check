import { HttpStatus, INestApplication } from '@nestjs/common';
import * as Request from 'supertest';
import { AppModuleMock } from './mock/app.module.mock';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let request: Request.SuperTest<Request.Test>;

  beforeAll(async () => {
    app = await AppModuleMock.bootstrap();
    await app.init();
    request = Request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return hello world', async () => {
      const response = await request.get('/').expect(HttpStatus.OK);
      expect(response.text).toEqual('Hello World!');
    });
  });
});
