
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { SECRET } from '../../config'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: SECRET,
    });
  }

  async validate(payload: any) {
    console.log('==== validate JWT ', payload)
    return { password: payload.password, username: payload.username };
  }
}
