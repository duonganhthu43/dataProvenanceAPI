import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FabricService } from '../fabric/fabric.service';
import { ChaincodeName } from '../constants';
import { InMemoryWallet } from 'fabric-network';
import { UserWalletService } from '../user-wallet/user-wallet.service';
import { UserWalletEntity } from '../user-wallet/user-wallet.entity';
@Injectable()
export class Workerservice {
    constructor(private fabricService: FabricService, private userWalletService: UserWalletService
    ) { }

    async handleCkanUser(userData: any) {
        switch (userData.topic) {
            case 'user/create':
                return await this.createCkanUser(userData)
            case 'user/update':
                return await this.updateCkanUser(userData)
            case 'user/delete':
                return await this.deleteCkanUser(userData)
        }
    }

    async handleCkanDataset(datasetInfo: any) {
        switch (datasetInfo.topic) {
            case 'dataset/create':
                return await this.createCkanDataset(datasetInfo)
            case 'dataset/update':
                return await this.updateCkanDataset(datasetInfo)
            case 'dataset/delete':
                return 'abc'
        }
    }

    async handleCkanResource(resourceInfo: any) {
        switch (resourceInfo.topic) {
            case 'resource/create':
                return await this.createCkanResource(resourceInfo)
            case 'resource/update':
                return await this.updateCkanResource(resourceInfo)
            case 'resource/delete':
                return 'abc'
        }
    }

    async handleCkanOrg(orgInfo: any) {
        console.log('==== handleCkanOrg', orgInfo)
        switch (orgInfo.topic) {
            case 'organization/create':
                return await this.createCkanOrg(orgInfo)
            case 'organization/update':
                return await this.updateCkanOrg(orgInfo)
            case 'organization/delete':
                return 'abc'
        }
    }

    private async createCkanOrg(resourceInfo) {
        return this.submitDataToBC(resourceInfo, 'organization_create')
    }
    private async updateCkanOrg(resourceInfo) {
        return this.submitDataToBC(resourceInfo, 'organization_update')
    }

    private async createCkanResource(resourceInfo) {
        return this.submitDataToBC(resourceInfo, 'resource_create')
    }
    private async updateCkanResource(resourceInfo) {
        return this.submitDataToBC(resourceInfo, 'resource_update')
    }

    private async createCkanDataset(datasetInfo): Promise<string> {
        return this.submitDataToBC(datasetInfo, 'dataset_create')
    }

    private async updateCkanDataset(datasetInfo): Promise<string> {
        return this.submitDataToBC(datasetInfo, 'dataset_update')
    }

    private async deleteCkanDataset(datasetInfo): Promise<string> {
        return this.submitDataToBC(datasetInfo, 'dataset_delete')
    }

    private async createCkanUser(userData): Promise<UserWalletEntity> {

        // {
        //     "about": null,
        //     "apikey": "eabf2ee9-b63c-44c6-8066-026367c33eec",
        //     "name": "user_1",
        //     "created": "2019-09-17T21:58:02.342148",
        //     "reset_key": null,
        //     "email": "user_1@gmail.com",
        //     "sysadmin": false,
        //     "activity_streams_email_notifications": false,
        //     "state": "active",
        //     "fullname": "user_1 fullname",
        //     "password": "$pbkdf2-sha512$25000$B0Dovdfam1OqFeL837tXCg$hWCd63ppZEnmxikornVrBS6fpHNqF0hdcG7PcF.pikMj7dsduQcIf5tfgFu1I3Di4P9OaDqybyYrvrmJq3qXdw",
        //     "id": "8cfe0fa7-adba-4bb5-ba2e-5cbbfb330472",
        //     "source": "http://localhost:5000",
        //     "topic": "user/create"
        //   }

        let resultSubmited =  await this.submitDataToBC(userData, 'user_create')
        return resultSubmited
    }

    private async updateCkanUser(userData): Promise<string> {
        return this.submitDataToBC(userData, 'user_update')
    }

    private async deleteCkanUser(userData): Promise<string> {
        return 'deleteCkanUser'
    }


    private async submitDataToBCByWallet(data: any, funcName: string, walletName: string, wallet: InMemoryWallet) {
        try {
            const submitedData = await this.fabricService.chaincodeInvokeWithWallet({
                chaincodeID: ChaincodeName,
                functionName: funcName,
                args: {
                    param: `${this.stringifyValue(data)}`
                }
            }, walletName, wallet)
            let result = submitedData.toString()
            return result
        } catch (err) {
            throw new HttpException({ message: err }, HttpStatus.BAD_REQUEST);
        }
    }

    private async submitDataToBC(data: any, funcName: string) {
        try {
            const submitDataByAdminCred = await this.fabricService.chaincodeInvokeByAdminOrg({
                chaincodeID: ChaincodeName,
                functionName: funcName,
                args: {
                    param: `${this.stringifyValue(data)}`
                }
            })
            let result = submitDataByAdminCred.toString()
            return result
        } catch (err) {
            throw new HttpException({ message: err }, HttpStatus.BAD_REQUEST);
        }
    }

    private stringifyValue(inpuValue: any) {
        return JSON.stringify(inpuValue, (key, value) => { if (value !== null) return value })
    }
}