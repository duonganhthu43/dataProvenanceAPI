
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { SECRET } from '../../config'
import { AuthService } from './auth.service';
import { UserWalletService } from '../user-wallet/user-wallet.service';
import { UserWalletEntity } from '../user-wallet/user-wallet.entity';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userWalletSerice: UserWalletService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: SECRET,
    });
  }

  async validate(payload: any) {
    const { username, password } = payload
    let currentUser:UserWalletEntity = await this.userWalletSerice.findByUserNamePassord({username, password})
    return { password: payload.password, username: payload.username, currentUser };
  }
}
