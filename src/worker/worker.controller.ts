import { DoneCallback, Job, Queue } from 'bull';
import { BullModule, InjectQueue } from 'nest-bull';
import { Controller, Get, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import { OrgCredential } from '../constants'

@Controller('worker')
export class WorkerController {
    constructor(
        @InjectQueue('test_queue') private readonly queue: Queue,
        private fabricService: FabricService
    ) { }

    @Get('checkCertificate') 
    async checkCertificate() {
        this.fabricService.validateAdminPortalCred()
    }

    @Post('callback')
    async webhookCallback(@Body() data: any) {
        let topic = data['topic']
        var jobQueue = 'ckanUser'
        if (topic === 'user/create' || topic === 'user/update' || topic === 'user/delete') {
            jobQueue = 'ckanUser'
        }
        if (topic === 'dataset/create' || topic === 'dataset/update' || topic === 'dataset/delete') {
            jobQueue = 'ckanDataset'
        }
        if (topic === 'resource/create' || topic === 'resource/update' || topic === 'resource/delete') {
            jobQueue = 'ckanResource'
        }
        if (topic === 'organization/create' || topic === 'organization/update' || topic === 'organization/delete') {
            jobQueue = 'ckanOrg'
        }
        let delayTime = 0;
        let jobCountByTypes = await this.queue.getActive(0)
        if (jobCountByTypes.length > 0) {
            let getCkanDatasetByname = jobCountByTypes.filter(j => j.name === jobQueue && j.data && j.data.id && data['entity'] && j.data.id === data['entity'].id)
            if (getCkanDatasetByname.length > 0) {
                delayTime = 5000
            }
        }
        return {
            message: 'ckanUser job created',
            data: await this.queue.add(jobQueue, { ...data['entity'], source: data['ckan'], user_ref: data['user_ref'], topic: data['topic'] }, { removeOnComplete: true, removeOnFail: true, delay: delayTime }),
        };
    }

}
