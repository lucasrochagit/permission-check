import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserListQueryDto } from './user.dto';
import { AuthScope } from '../common/guard/authorization/authorization.decorator';
import { AuthorizationGuard } from '../common/guard/authorization/authorization.guard';

@Controller('users')
@UseGuards(AuthorizationGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  create() {
    return this.service.create();
  }

  @Get()
  @AuthScope({ scopes: ['user:read'] })
  list(@Query() query: UserListQueryDto) {
    return this.service.list(Number(query.size || '2'));
  }

  @Get(':user_id')
  @AuthScope({
    scopes: ['user:read', 'user:read_own'],
    ownerParam: 'user_id',
  })
  getById(@Param('user_id') id: string) {
    return this.service.getById(id);
  }

  @Put(':user_id')
  @AuthScope({
    scopes: ['user:delete', 'user:delete_own'],
    ownerParam: 'user_id',
  })
  updateById(@Param('user_id') id: string) {
    return this.service.updateById(id);
  }

  @Delete(':user_id')
  @AuthScope({
    scopes: ['user:delete', 'user:delete_own'],
    ownerParam: 'user_id',
  })
  deleteById(@Param('user_id') id: string) {
    return this.service.deleteById(id);
  }
}
