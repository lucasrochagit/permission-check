import { IsNumberString, ValidateIf } from 'class-validator';

export class UserListQueryDto {
  @IsNumberString()
  @ValidateIf((item) => item.size !== null && item.size !== undefined)
  size: string;
}
