import { Injectable } from '@nestjs/common';
import { getFullName, getId } from 'json-generator';

@Injectable()
export class UserService {
  create() {
    return {
      id: getId('objectId'),
      name: getFullName(),
    };
  }

  list(length: number) {
    if (length < 1 || length > 10) {
      length = 10;
    }
    return Array.from({ length }, (_) => ({
      id: getId('objectId'),
      name: getFullName(),
    }));
  }

  getById(id: string) {
    return {
      id,
      name: getFullName(),
    };
  }

  updateById(id: string) {
    return {
      id,
      name: getFullName(),
    };
  }

  deleteById(id: string) {
    return {
      deletedId: id,
    };
  }
}
