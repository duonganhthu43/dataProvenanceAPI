import { IsNotEmpty } from 'class-validator';

export class ActivatedUser {
  @IsNotEmpty()
  readonly about: string;
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  readonly fullname: string;
  @IsNotEmpty()
  readonly email: string;
  @IsNotEmpty()
  readonly username: string;
  @IsNotEmpty()
  readonly password: string;
}