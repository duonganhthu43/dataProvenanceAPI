import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FabricService } from '../fabric/fabric.service';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import { UserWalletEntity } from '../user-wallet/user-wallet.entity';
import { Identity } from 'fabric-network';
import { ChaincodeName } from '../constants'
import { UpdateDocumentAttDTO } from './dto/updateDocumentAtt.dto';
import { UpdateDocumentDTO } from './dto/updateDocument.dto';

@Injectable()
export class DocumentService {
    constructor(private fabricService: FabricService) { }

    async createNewDocument(createDocument: CreateDocumentDTO, userInfo: { username: string, currentUser: UserWalletEntity }) {
        try {
            const userName = userInfo.username
            const fabricIdentity: Identity = userInfo.currentUser && userInfo.currentUser.fabricIdentity
            let currentWallet = await FabricService.createWalletFromFabricIdentity(userName, fabricIdentity);
            let respondBuffer = await this.fabricService.chaincodeInvoke(userName, {
                chaincodeID: ChaincodeName,
                functionName: 'document_create',
                args: {
                    param: `${this.stringifyValue(createDocument)}`
                }
            }, currentWallet)
            return respondBuffer.toString()
        } catch (err) {
            throw new HttpException({ message: 'Error has occured', errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    async updateAttribute(updateAttInfo: UpdateDocumentAttDTO, userInfo: { username: string, currentUser: UserWalletEntity }) {
        try {
            const userName = userInfo.username
            const fabricIdentity: Identity = userInfo.currentUser && userInfo.currentUser.fabricIdentity
            let currentWallet = await FabricService.createWalletFromFabricIdentity(userName, fabricIdentity);
            let respondBuffer = await this.fabricService.chaincodeInvoke(userName, {
                chaincodeID: ChaincodeName,
                functionName: 'document_updateAttributes',
                args: {
                    param: `${this.stringifyValue(updateAttInfo)}`
                }
            }, currentWallet)
            return respondBuffer.toString()
        } catch (err) {
            throw new HttpException({ message: 'Error has occured', errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    async updateDocument(updateInfo: UpdateDocumentDTO, userInfo: { username: string, currentUser: UserWalletEntity }) {
        try {
            const userName = userInfo.username
            const fabricIdentity: Identity = userInfo.currentUser && userInfo.currentUser.fabricIdentity
            let currentWallet = await FabricService.createWalletFromFabricIdentity(userName, fabricIdentity);
            let respondBuffer = await this.fabricService.chaincodeInvoke(userName, {
                chaincodeID: ChaincodeName,
                functionName: 'document_updateDocument',
                args: {
                    param: `${this.stringifyValue(updateInfo)}`
                }
            }, currentWallet)
            return respondBuffer.toString()
        } catch (err) {
            throw new HttpException({ message: 'Error has occured', errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    private stringifyValue(inpuValue: any) {
        return JSON.stringify(inpuValue, (key, value) => { if (value !== null) return value })
    }

    async getAllDocs(userInfo: { username: string, currentUser: UserWalletEntity }) {
        try {
            const userName = userInfo.username
            const fabricIdentity: Identity = userInfo.currentUser && userInfo.currentUser.fabricIdentity
            let currentWallet = await FabricService.createWalletFromFabricIdentity(userName, fabricIdentity);

            let respondBuffer = await this.fabricService.chainCodeQuery(userName, {
                chaincodeID: ChaincodeName,
                functionName: 'document_allDocs',
                args: {
                }
            }, currentWallet)
            return respondBuffer.toString()
        } catch (err) {
            throw new HttpException({ message: 'Error has occured', errors: err }, HttpStatus.BAD_REQUEST);
        }
    }
    async getAllDocsByHash(userInfo: { username: string, currentUser: UserWalletEntity }, hash: string) {
        try {
            const userName = userInfo.username
            const fabricIdentity: Identity = userInfo.currentUser && userInfo.currentUser.fabricIdentity
            let currentWallet = await FabricService.createWalletFromFabricIdentity(userName, fabricIdentity);

            let respondBuffer = await this.fabricService.chainCodeQuery(userName, {
                chaincodeID: ChaincodeName,
                functionName: 'document_allDocsByHash',
                args: {
                    param: hash
                }
            }, currentWallet)
            return respondBuffer.toString()
        } catch (err) {
            throw new HttpException({ message: 'Error has occured', errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    async getHistoryByDocumentID(userInfo: { username: string, currentUser: UserWalletEntity }, documentID: string) {
        try {
            const userName = userInfo.username
            const fabricIdentity: Identity = userInfo.currentUser && userInfo.currentUser.fabricIdentity
            let currentWallet = await FabricService.createWalletFromFabricIdentity(userName, fabricIdentity);
            let respondBuffer = await this.fabricService.chainCodeQuery(userName, {
                chaincodeID: ChaincodeName,
                functionName: 'document_getHistoryByDocumentId',
                args: {
                    param: documentID
                }
            }, currentWallet)
            return respondBuffer.toString()
        } catch (err) {
            throw new HttpException({ message: 'Error has occured', errors: err }, HttpStatus.BAD_REQUEST);
        }
    }
}
