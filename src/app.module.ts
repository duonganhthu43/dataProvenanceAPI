import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { UserWalletModule } from './user-wallet/user-wallet.module';
import { FabricModule } from './fabric/fabric.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './document/document.controller';
import { DocumentService } from './document/document.service';
import { DocumentModule } from './document/document.module';
import { WorkerModule } from './worker/worker.module';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule, UserWalletModule, FabricModule, DocumentModule, WorkerModule],
  controllers: [AppController, DocumentController],
  providers: [AppService, DocumentService],
})
export class AppModule { }
