import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { text } from 'body-parser';
import { UserWalletService } from '../user-wallet/user-wallet.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password:string): Promise<any> {
    const user = await this.authService.validateUserByUserNamePassword({username, password})
    if(!user)  throw new UnauthorizedException()
    return user;
  }
}