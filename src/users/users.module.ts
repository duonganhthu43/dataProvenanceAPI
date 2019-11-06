import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FabricModule } from '../fabric/fabric.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FabricModule, AuthModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
