import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import {BullModule} from 'nest-bull';
import {DoneCallback, Job} from 'bull';
import { WorkerQueue } from './worker.queue';
import { FabricModule } from '../fabric/fabric.module';
import { Workerservice } from './worker.service';
import { UserWalletModule } from '../user-wallet/user-wallet.module';

@Module({
  imports: [BullModule.register({
    name: 'test_queue',
    options: {
      redis: {
        port: 6379,
      },
    },
  }), FabricModule, UserWalletModule],
  controllers: [WorkerController],
  providers: [WorkerQueue, Workerservice],

})
export class WorkerModule {}
