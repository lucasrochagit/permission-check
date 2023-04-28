import { TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserModuleMock } from '../../test/mock/user.module.mock';
import { UserListQueryDto } from './user.dto';

describe('UserController', () => {
  let module: TestingModule;
  let controller: UserController;

  beforeAll(async () => {
    module = await UserModuleMock.module();
    controller = module.get<UserController>(UserController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should return the created user', () => {
      const result = controller.create();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });
  });

  describe('list()', () => {
    it('should return a list of users', () => {
      const result = controller.list({} as UserListQueryDto);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
    it('should return a list of users with defined size', () => {
      const result = controller.list({ size: '2' } as UserListQueryDto);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
  });

  describe('getById()', () => {
    it('should return the founded user', () => {
      const result = controller.getById('123');
      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('name');
    });
  });

  describe('updateById()', () => {
    it('should return the updated user', () => {
      const result = controller.updateById('123');
      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('name');
    });
  });

  describe('deleteById()', () => {
    it('should return the id from deleted user', () => {
      const result = controller.deleteById('123');
      expect(result).toHaveProperty('deletedId', '123');
    });
  });
});
