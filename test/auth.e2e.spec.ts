import { HttpStatus, INestApplication } from '@nestjs/common';
import * as Request from 'supertest';
import { AuthModuleMock } from './mock/auth.module.mock';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let request: Request.SuperTest<Request.Test>;

  beforeAll(async () => {
    app = await AuthModuleMock.bootstrap();
    await app.init();
    request = Request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth', () => {
    const scopes = {
      user: ['user:read_own', 'user:update_own', 'user:delete_own'],
      admin: ['user:read', 'user:update', 'user:delete'],
    };

    it('should return the auth info from user', async () => {
      const response = await request
        .post('/auth')
        .send({ type: 'user' })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('sub');
      expect(response.body).toHaveProperty('type', 'user');
      expect(response.body).toHaveProperty('scopes', scopes.user);
      expect(response.body).toHaveProperty('access_token');
    });
    it('should return the auth info from admin', async () => {
      const response = await request
        .post('/auth')
        .send({ type: 'admin' })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('sub');
      expect(response.body).toHaveProperty('type', 'admin');
      expect(response.body).toHaveProperty('scopes', scopes.admin);
      expect(response.body).toHaveProperty('access_token');
    });
    it('should return status code 400 and error for does not inform type', async () => {
      const response = await request
        .post('/auth')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty(
        'statusCode',
        HttpStatus.BAD_REQUEST,
      );
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Bad Request');
    });
  });
});
