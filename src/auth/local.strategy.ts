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
    console.log('===== auth validate ',username,  password)
    const user = await this.authService.validateUserByUserNamePassword({username, password})
    console.log('=== user not found')
    if(!user)  throw new UnauthorizedException()
    return user;
  }
}