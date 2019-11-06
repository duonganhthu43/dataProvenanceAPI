import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import connectionProfile from '../../connection.json'
import FabricClient, { User } from 'fabric-client'
import { FileSystemWallet, Gateway, X509WalletMixin, InMemoryWallet, Wallet, DefaultEventHandlerStrategies, DefaultQueryHandlerStrategies } from 'fabric-network'
import FabricCAServices from 'fabric-ca-client'
import { Identity, AbstractEventHubSelectionStrategy } from 'fabric-network'
import * as path from 'path';
import { OrgCredential } from '../constants'
import x509 from 'x509'
import Client from 'fabric-client';
const yaml = require('js-yaml');
class ExampleEventHubSelectionStrategy implements AbstractEventHubSelectionStrategy {
    private peers: any
    private disconnectedPeers: any[]
    private cleanupInterval = null
    constructor(peers) {
        this.peers = peers;
        this.disconnectedPeers = [];

        this.cleanupInterval = null;
    }
    _disconnectedPeerCleanup() {
        this.cleanupInterval = setInterval(() => {
            // Reset the list of disconnected peers every 10 seconds
            for (const peerRecord of this.disconnectedPeers) {
                // If 10 seconds has passed since the disconnect
                if (Date.now() - peerRecord.time > 10000) {
                    this.disconnectedPeers = this.disconnectedPeers.filter((p) => p !== peerRecord.peer);
                }
            }

            if (this.disconnectedPeers.length === 0) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }
        }, 10000);
    }
    /**
     * Returns the next peer in the list per the strategy implementation
     * @returns {ChannelPeer}
     */
    getNextPeer() {
        // Only select those peers that have not been disconnected recently
        let availablePeers = this.peers.filter((peer) => this.disconnectedPeers.indexOf(peer) === -1)
        if (availablePeers.length === 0) {
            availablePeers = this.peers;
        }
        const randomPeerIdx = Math.floor(Math.random() * availablePeers.length);
        return availablePeers[randomPeerIdx];
    }

    /**
     * Updates the status of a peers event hub
     * @param {ChannelPeer} deadPeer The peer that needs its status updating
     */
    updateEventHubAvailability(deadPeer) {
        if (!this.cleanupInterval) {
            this._disconnectedPeerCleanup()
        }
        this.disconnectedPeers.push({ peer: deadPeer, time: Date.now() })
    }
}
// function EXAMPLE_EVENT_HUB_SELECTION_FACTORY(network) {
//     const orgPeers = getOrganizationPeers(network);
//     const eventEmittingPeers = filterEventEmittingPeers(orgPeers);
//     return new ExampleEventHubSelectionStrategy(eventEmittingPeers);
// }
@Injectable()
export class FabricService {
    static async createWalletFromFabricIdentity(username: string, fabricIdentity: Identity): Promise<InMemoryWallet> {
        let wallet: InMemoryWallet = new InMemoryWallet()
        await wallet.import(username, fabricIdentity)
        return wallet

    }
    static async checkBlockListener() {
        let wallet = await FabricService.createWalletFromFabricIdentity(FabricService.organizationAdmin, <Identity>OrgCredential.identity)
        console.log('===== checkBlockListener is called')
        let gateway: Gateway;
        try {
            const gatewayOptions = {
                identity: FabricService.organizationAdmin,
                wallet: wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                },
                eventHandlerOptions: {
                    strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX,
                    commitTimeout: 300
                },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_ROUND_ROBIN,
                    commitTimeout: 300
                }
            };
            gateway = new Gateway();
            var client = Client.loadFromConfig('./connections.yaml')
            await gateway.connect(client, gatewayOptions);
            const network = await gateway.getNetwork('ch1');
            const listener = await network.addBlockListener('my-block-listener', (error, block) => {
                console.log('====== listenter ')
                if (error) {
                    console.error(error);
                    return;
                }
                console.log(`Block: ${block}`);
            });
            // if (type === 'invoke') {
            //     result = await contract.submitTransaction(invokeRequest.functionName, ...argument);
            // }
            // else {
            //     result = await contract.evaluateTransaction(invokeRequest.functionName, ...argument);
            // }
        }
        catch (err) {
            throw new HttpException({ error: "An Error has occured", err: err }, HttpStatus.EXPECTATION_FAILED)
        }
        finally {
            if (gateway)
                gateway.disconnect();
        }
    }

    private wallet: InMemoryWallet = undefined
    private static organizationAdmin = `${OrgCredential.name.trim().replace(/ /g, '_')}_admin`

    private async constructAdminWallet() {
        return FabricService.createWalletFromFabricIdentity(FabricService.organizationAdmin, <Identity>OrgCredential.identity)
    }

    public async validateAdminPortalCred() {
        this.wallet = await this.constructAdminWallet()
        return this.wallet
    }

    public static getFingerPrintFromCertPEM(pemInput: string): string {
        let normalize = FabricClient.normalizeX509(pemInput)
        var cert1 = x509.parseCert(normalize)
        return cert1['fingerPrint']
    }
    public async createOrgMember(input: { username: string, password: string }): Promise<InMemoryWallet> {
        let gateway = new Gateway();
        try {
            if (!this.wallet) {
                this.wallet = await this.constructAdminWallet()
            }
            const gatewayOptions = {
                identity: FabricService.organizationAdmin,
                wallet: this.wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                },
                eventHandlerOptions: {
                    strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX
                },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_ROUND_ROBIN
                },
                // eventHubSelectionOptions: {
                //     strategy: DefaultEventHubSelectionStrategies.MSPID_SCOPE_ROUND_ROBIN
                // }
            };
            gateway = new Gateway();
            await gateway.connect(connectionProfile, gatewayOptions);
            let client = gateway.getClient();
            let a = new FabricClient()
            let ca = client.getCertificateAuthority();
            let registrar = gateway.getCurrentIdentity();
            const registrationRequest = {
                enrollmentID: input.username,
                enrollmentSecret: input.password,
                affiliation: '',
                maxEnrollments: 0,
                role: 'user',
                attrs: [{ name: "memberOf", value: OrgCredential.name }, { name: "organizationId", value: OrgCredential.ClientID, ecert: true }, { name: "hf.Registrar.Roles", value: 'client,user,peer', ecert: true }]
            };
            const registerResult = await ca.register(registrationRequest, registrar);
            const enrollmentRequest = {
                enrollmentID: input.username,
                enrollmentSecret: input.password
            };
            const enrollment = await ca.enroll(enrollmentRequest);
            const mspID = client.getMspid();
            const cert = enrollment.certificate;
            const key = enrollment.key.toBytes();
            const identity = X509WalletMixin.createIdentity(mspID, cert, key);
            gateway.disconnect();
            return await this.createWalletwithUserIdentity(input.username, identity)
        }
        catch (err) {
            console.log('==== errr ', err)
            throw Error(err)
        }
        finally {
            if (gateway) {
                gateway.disconnect()
            }
        }
    }

    public async createFabricUser(userInput: { username: string, password: string }): Promise<InMemoryWallet> {
        let gateway = new Gateway();
        let userName = userInput['name'] || userInput.username
        try {
            if (!this.wallet) {
                this.wallet = await this.constructAdminWallet()
            }
            const gatewayOptions = {
                identity: FabricService.organizationAdmin,
                wallet: this.wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                },
                eventHandlerOptions: {
                    strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX
                },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_ROUND_ROBIN
                }
            };

            gateway = new Gateway();
            await gateway.connect(connectionProfile, gatewayOptions);
            let client = gateway.getClient();
            let ca = client.getCertificateAuthority();
            let registrar = gateway.getCurrentIdentity();
            // create user attribute
            let keys = Object.keys(userInput)
            var attributes = []
            if (keys && keys.length > 0) {
                attributes = keys.reduce((total, currentValue, currentIndex, arr) => {
                    if (currentValue === 'password' || userInput[currentValue] === undefined) { return total }
                    return total.concat([{ name: currentValue, value: JSON.stringify(userInput[currentValue]), ecert: true }])
                }, [
                    { name: "hf.Registrar.Roles", value: 'client,user', ecert: true },
                    { name: "hf.Registrar.DelegateRoles", value: 'client,user', ecert: true },
                    { name: 'hf.Revoker', value: 'true', ecert: true },
                    { name: "hf.Registrar.Attributes", value: "*", ecert: true },
                    { name: "admin", value: "false", ecert: true }
                ])
            }
            const registrationRequest = {
                enrollmentID: userName,
                enrollmentSecret: userInput.password,
                affiliation: '',
                maxEnrollments: 0,
                role: 'user',
                attrs: attributes
            };
            let registerResult;
            try {
                registerResult = await ca.register(registrationRequest, registrar);
            } catch (err) {
                if (err.message.includes('is already registered')) {
                    registerResult = userInput.password
                } else {
                    throw new HttpException(err, HttpStatus.EXPECTATION_FAILED)
                }
                console.log('==== registerResult is already registered', err.message.includes('is already registered'))
            }
            const enrollmentRequest = {
                enrollmentID: userName,
                enrollmentSecret: registerResult
            };
            const enrollment = await ca.enroll(enrollmentRequest);
            const mspID = client.getMspid();
            const cert = enrollment.certificate;
            const key = enrollment.key.toBytes();
            const identity = X509WalletMixin.createIdentity(mspID, cert, key);
            return await this.createWalletwithUserIdentity(userName, identity)
        }
        catch (ex) {
            throw new HttpException(ex, HttpStatus.EXPECTATION_FAILED)
        }
        finally {
            if (gateway) {
                gateway.disconnect()
            }
        }
    }

    public async createWalletwithUserIdentity(userName: string, identity: Identity): Promise<InMemoryWallet> {
        let wallet: InMemoryWallet = new InMemoryWallet()
        await wallet.import(userName, identity)
        return wallet
    }

    public async getUserByIdentity(identityName: string, identityWallet: Wallet): Promise<User> {
        let gateway: Gateway
        try {
            const gatewayOptions = {
                identity: identityName,
                wallet: identityWallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                },
                eventHandlerOptions: {
                    strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ALLFORTX
                },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_ROUND_ROBIN
                },
                // eventHubSelectionOptions: {
                //     strategy: DefaultEventHubSelectionStrategies.MSPID_SCOPE_ROUND_ROBIN
                // }
            };
            let gateway = new Gateway();
            await gateway.connect(connectionProfile, gatewayOptions);
            let user = gateway.getCurrentIdentity()
            return user

        } catch (err) {
            throw new HttpException({ error: "An Error has occured", err: err }, HttpStatus.EXPECTATION_FAILED)
        } finally {
            if (gateway) {
                gateway.disconnect()
            }
        }
    }

    public async chaincodeInvokeByAdminOrg(invokeRequest: InvokeRequest) {
        if (!this.wallet) {
            this.wallet = await this.constructAdminWallet()

            //this.wallet = await FabricService.enrollAdminWallet(FabricService.organizationAdmin, OrgCredential.ClientSecrect, FabricService.organizationAdmin)
        }
        return await this.chaincodeInvoke(FabricService.organizationAdmin, invokeRequest, this.wallet)
    }

    public async chaincodeQuerryByAdminOrg(invokeRequest: InvokeRequest) {
        if (!this.wallet) {
            this.wallet = await this.constructAdminWallet()
        }
        return await this.chainCodeQuery(FabricService.organizationAdmin, invokeRequest, this.wallet)
    }


    public async chaincodeInvokeWithWallet(invokeRequest: InvokeRequest, username: string, wallet: InMemoryWallet) {
        return await this.chaincodeInvoke(username, invokeRequest, wallet)
    }



    private async getTransactionId(userName: string, invokeRequest: InvokeRequest, wallet: Wallet, type: string) {
        const ccID = invokeRequest.chaincodeID;
        let gateway: Gateway;
        try {
            const gatewayOptions = {
                identity: userName,
                wallet: wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                },
                eventHandlerOptions: {
                    strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX,
                    commitTimeout: 300
                },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_ROUND_ROBIN,
                    commitTimeout: 300
                }
            };
            gateway = new Gateway();
            var client = Client.loadFromConfig('./connections.yaml')
            await gateway.connect(client, gatewayOptions);
            const network = await gateway.getNetwork('ch1');
            const contract = network.getContract(ccID);
            const argument: string[] = Object.values<string>(invokeRequest.args)
            let result;
            // if (type === 'invoke') {
            //     result = await contract.submitTransaction(invokeRequest.functionName, ...argument);
            // }
            // else {
            //     result = await contract.evaluateTransaction(invokeRequest.functionName, ...argument);
            // }
            return result
        }
        catch (err) {
            throw new HttpException({ error: "An Error has occured", err: err }, HttpStatus.EXPECTATION_FAILED)
        }
        finally {
            if (gateway)
                gateway.disconnect();
        }
    }

    private async chaincodeExecute(userName: string, invokeRequest: InvokeRequest, wallet: Wallet, type: string) {
        const ccID = invokeRequest.chaincodeID;
        let gateway: Gateway;
        try {
            const gatewayOptions = {
                identity: userName,
                wallet: wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                },
                eventHandlerOptions: {
                    strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX,
                    commitTimeout: 300
                },
                queryHandlerOptions: {
                    strategy: DefaultQueryHandlerStrategies.MSPID_SCOPE_ROUND_ROBIN,
                    commitTimeout: 300
                }
            };
            gateway = new Gateway();
            var client = Client.loadFromConfig('./connections.yaml')
            await gateway.connect(client, gatewayOptions);
            const network = await gateway.getNetwork('ch1');
            const contract = network.getContract(ccID);
            const argument: string[] = Object.values<string>(invokeRequest.args)
            let result;
            // await network.addBlockListener('my-block-listener', (error, block) => {
            //     if (error) {
            //         console.error(error);
            //         return;
            //     }
            //     console.log()
            //     console.log(`Block: ${JSON.stringify(block)}`);
            //     console.log()

            // });
            if (type === 'invoke') {
                result = await contract.submitTransaction(invokeRequest.functionName, ...argument);
            }
            else {
                result = await contract.evaluateTransaction(invokeRequest.functionName, ...argument);
            }
            return result
        }
        catch (err) {
            throw new HttpException({ error: "An Error has occured", err: err }, HttpStatus.EXPECTATION_FAILED)
        }
        finally {
            
            if (gateway)
                gateway.disconnect();
        }
    }

    async chainCodeQuery(userName: string, invokeRequest: InvokeRequest, wallet: Wallet) {
        return await this.chaincodeExecute(userName, invokeRequest, wallet, 'query')
    }
    public async chaincodeInvoke(userName: string, invokeRequest: InvokeRequest, wallet: Wallet) {
        return await this.chaincodeExecute(userName, invokeRequest, wallet, 'invoke')
    }
}
export interface InvokeRequest {
    chaincodeID: string;
    functionName: string;
    args: any
}