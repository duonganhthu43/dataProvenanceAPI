import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.stategy';
import { SECRET } from '../../config'
import { UserWalletModule } from '../user-wallet/user-wallet.module';

@Module({
  imports: [JwtModule.register({
    secret: SECRET,
    signOptions: { expiresIn: '10h' },
  }), PassportModule, UserWalletModule],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, UserWalletModule]

})
export class AuthModule { }
