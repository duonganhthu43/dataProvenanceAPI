import { IsNotEmpty } from 'class-validator';

export class UserCriteria {
  // @IsNotEmpty()
  // readonly userId: string;
  @IsNotEmpty()
  readonly apikey: string;
  @IsNotEmpty()
  readonly email: string;
}