import { IsNotEmpty } from 'class-validator';

export class QueryDocByHashDTO {
  @IsNotEmpty()
  readonly hash: string;
}