import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserWalletService } from '../user-wallet/user-wallet.service';
import { UserWalletEntity } from '../user-wallet/user-wallet.entity';
import * as crypto from 'crypto'

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly userWalletService: UserWalletService) { }

  async validateUserByUserNamePassword(user: { username: string, password: string }): Promise<UserWalletEntity> {
    return await this.userWalletService.findByUserNamePassord({username: user.username, password: crypto.createHmac('sha256', user.password).digest('hex')})
  }
  async login(user: { username: string, password: string }): Promise<{ access_token: string }> {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}