import { IsIn, IsNotEmpty, ValidateIf } from 'class-validator';

export class AuthDto {
  @ValidateIf((target) => target.id !== null && target.id !== undefined)
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsIn(['admin', 'user'])
  type: string;
}
