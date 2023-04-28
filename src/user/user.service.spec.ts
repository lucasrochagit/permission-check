import { TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModuleMock } from '../../test/mock/user.module.mock';

describe('UserService', () => {
  let module: TestingModule;
  let service: UserService;

  beforeAll(async () => {
    module = await UserModuleMock.module();
    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should return the created user', () => {
      const result = service.create();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });
  });

  describe('list()', () => {
    it('should return a list of users', () => {
      const result = service.list(11);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(10);
      result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
  });

  describe('getById()', () => {
    it('should return the founded user', () => {
      const result = service.getById('123');
      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('name');
    });
  });

  describe('updateById()', () => {
    it('should return the updated user', () => {
      const result = service.updateById('123');
      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('name');
    });
  });

  describe('deleteById()', () => {
    it('should return the id from deleted user', () => {
      const result = service.deleteById('123');
      expect(result).toHaveProperty('deletedId', '123');
    });
  });
});
