import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UserWalletModule } from './user-wallet/user-wallet.module';
import { FabricModule } from './fabric/fabric.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({


  imports: [TypeOrmModule.forRoot(), UsersModule, UserWalletModule, FabricModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
