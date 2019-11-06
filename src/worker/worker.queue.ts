import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueEvent,
  BullQueueEvents,
  OnQueueRemoved,
  OnGlobalQueueCompleted,
  OnGlobalQueueRemoved,
} from 'nest-bull';
import { Job, DoneCallback } from 'bull';
import { Logger } from '@nestjs/common';
import { threadId } from 'worker_threads';
import { Workerservice } from './worker.service';

@Processor({ name: 'test_queue' })
export class WorkerQueue {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly workerService: Workerservice) { }

  @Process({ name: 'ckanUser', concurrency: 5 })
  processCkanUser(job: Job<any>, callback: DoneCallback) {
    callback(null, this.workerService.handleCkanUser(job.data))
  }

  @Process({ name: 'ckanOrg', concurrency: 5 })
  processCkanOrg(job: Job<any>, callback: DoneCallback) {
    callback(null, this.workerService.handleCkanOrg(job.data))
  }

  @Process({ name: 'ckanDataset' })
  processCkanDataset(job: Job<any>, callback: DoneCallback) {
    callback(null, this.workerService.handleCkanDataset(job.data))
  }

  @Process({ name: 'ckanResource', concurrency: 1 })
  processCkanResource(job: Job<any>, callback: DoneCallback) {
    callback(null, this.workerService.handleCkanResource(job.data))
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );
  }

  @OnQueueRemoved()
  onRemove(job: Job) {
    this.logger.log(
      `======= Removing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }


  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job, result) {
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with result ${job.returnvalue}`,
    );
    job.remove()
  }
}