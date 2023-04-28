import { SetMetadata } from '@nestjs/common';

export type Scope = {
  scopes: string[];
  ownerParam?: string;
};

export const AuthScope = (authScope?: Scope) =>
  SetMetadata('authScope', authScope);
