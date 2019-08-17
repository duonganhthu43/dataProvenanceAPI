import { Module } from '@nestjs/common';
import { UserWalletService } from './user-wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWalletEntity } from './user-wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserWalletEntity])],
  providers: [UserWalletService],
  exports: [UserWalletService]
})
export class UserWalletModule { }
