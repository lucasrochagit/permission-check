import { HttpStatus, INestApplication } from '@nestjs/common';
import * as Request from 'supertest';
import { UserModuleMock } from './mock/user.module.mock';
import { TestingModule } from '@nestjs/testing';
import { AuthModuleMock } from './mock/auth.module.mock';
import { AuthService } from '../src/auth/auth.service';
import { AuthDto } from '../src/auth/auth.dto';
import { getId } from 'json-generator';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let request: Request.SuperTest<Request.Test>;
  let authModule: TestingModule;
  let authService: AuthService;
  let userToken: string;
  let userId: string;
  let adminToken: string;

  beforeAll(async () => {
    authModule = await AuthModuleMock.module();
    authService = authModule.get<AuthService>(AuthService);
    const userAuth = await authService.signIn({ type: 'user' } as AuthDto);
    const adminAuth = await authService.signIn({ type: 'admin' } as AuthDto);
    userToken = userAuth.access_token;
    userId = userAuth.sub;
    adminToken = adminAuth.access_token;

    app = await UserModuleMock.bootstrap();
    await app.init();
    request = Request(app.getHttpServer());
  });

  afterAll(async () => {
    await authModule.close();
    await app.close();
  });

  describe('POST /users', () => {
    it('should return a created user', async () => {
      const response = await request.post('/users').expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
  });

  describe('GET /users', () => {
    it('should return a list of users for admin type', async () => {
      const response = await request
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      response.body.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
    it('should return status code 401 and UnauthorizedException for not send token', async () => {
      const response = await request
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty(
        'statusCode',
        HttpStatus.UNAUTHORIZED,
      );
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
    it('should return status code 403 and ForbiddenException for user type', async () => {
      const response = await request
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body).toHaveProperty('statusCode', HttpStatus.FORBIDDEN);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Forbidden');
    });
  });

  describe('GET /users/{user_id}', () => {
    const id = getId('objectId');
    it('should return a single user for admin type', async () => {
      const response = await request
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
    it('should return a single user for user type and he is the owner', async () => {
      const response = await request
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
    it('should return status code 401 and UnauthorizedException for not send token', async () => {
      const response = await request
        .get(`/users/${id}`)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty(
        'statusCode',
        HttpStatus.UNAUTHORIZED,
      );
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
    it('should return status code 403 and ForbiddenException for user type and he is not the owner', async () => {
      const response = await request
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body).toHaveProperty('statusCode', HttpStatus.FORBIDDEN);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Forbidden');
    });
  });

  describe('PUT /users/{user_id}', () => {
    const id = getId('objectId');
    it('should return the updated user for admin type', async () => {
      const response = await request
        .put(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
    it('should return the updated user for user type and he is the owner', async () => {
      const response = await request
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });
    it('should return status code 401 and UnauthorizedException for not send token', async () => {
      const response = await request
        .put(`/users/${id}`)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty(
        'statusCode',
        HttpStatus.UNAUTHORIZED,
      );
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
    it('should return status code 403 and ForbiddenException for user type and he is not the owner', async () => {
      const response = await request
        .put(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body).toHaveProperty('statusCode', HttpStatus.FORBIDDEN);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Forbidden');
    });
  });

  describe('DELETE /users/{user_id}', () => {
    const id = getId('objectId');
    it('should return the deleted user id for admin type', async () => {
      const response = await request
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('deletedId', id);
    });
    it('should return the deleted user id for user type and he is the owner', async () => {
      const response = await request
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('deletedId', userId);
    });
    it('should return status code 401 and UnauthorizedException for not send token', async () => {
      const response = await request
        .delete(`/users/${id}`)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toHaveProperty(
        'statusCode',
        HttpStatus.UNAUTHORIZED,
      );
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
    it('should return status code 403 and ForbiddenException for user type and he is not the owner', async () => {
      const response = await request
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body).toHaveProperty('statusCode', HttpStatus.FORBIDDEN);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Forbidden');
    });
  });
});
