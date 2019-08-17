import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserWalletEntity } from '../user-wallet/user-wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { FabricService } from '../fabric/fabric.service';
import { FabricModule } from '../fabric/fabric.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [FabricModule, AuthModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
