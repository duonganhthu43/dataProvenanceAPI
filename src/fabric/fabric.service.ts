import { Injectable } from '@nestjs/common';
import connectionProfile from '../../connection.json'
import FabricClient, { User } from 'fabric-client'
import { FileSystemWallet, Gateway, X509WalletMixin, InMemoryWallet, Wallet } from 'fabric-network'
import FabricCAServices from 'fabric-ca-client'
import { Identity } from 'fabric-network'
import * as path from 'path';
import { OrgCredential } from '../constants'


@Injectable()
export class FabricService {
    static async enrollAdminWallet(ClientId: string, ClientSecrect: string, adminName: string): Promise<InMemoryWallet> {
        let wallet: InMemoryWallet = new InMemoryWallet()
        const caKeys = Object.keys(connectionProfile.certificateAuthorities);
        const caUrl = connectionProfile.certificateAuthorities[caKeys[0]].url;
        let caService = new FabricCAServices(caUrl);
        let registrarId = ClientId;
        let registrarPw = ClientSecrect
        const enrollment = await caService.enroll({ enrollmentID: registrarId, enrollmentSecret: registrarPw });
        let client = FabricClient.loadFromConfig(connectionProfile);
        const mspID = client.getMspid();
        const cert = enrollment.certificate;
        const key = enrollment.key.toBytes();
        const identity = X509WalletMixin.createIdentity(mspID, cert, key);
        await wallet.import(adminName, identity);
        return wallet
    }

    private wallet: InMemoryWallet = undefined
    private organizationAdmin = `${OrgCredential.name.trim().replace(' ', '')}_admin`

    public async createOrgMember(input: { username: string, password: string }): Promise<InMemoryWallet> {
        let gateway = new Gateway();
        try {
            if (!this.wallet) {
                this.wallet = await FabricService.enrollAdminWallet(this.organizationAdmin, OrgCredential.ClientSecrect, this.organizationAdmin)
            }
            const gatewayOptions = {
                identity: this.organizationAdmin,
                wallet: this.wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                }
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
            // if (role === 'admin') {
            //     attrs = attrs.concat([
            //         { name: "hf.Registrar.Roles", value: 'client,user,peer,validator,auditor,ca', ecert: true },
            //         { name: "hf.Registrar.DelegateRoles", value: 'client,user,validator,auditor', ecert: true },
            //         { name: 'hf.Revoker', value: 'true', ecert: true },
            //         { name: "hf.Registrar.Attributes", value: "*", ecert: true },
            //         { name: "admin", value: "true", ecert: true }
            //     ])
            // }
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

    // private wallet = new FileSystemWallet(path.resolve(__dirname, `myStorageConfig`));
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
                }
            };
            let gateway = new Gateway();
            await gateway.connect(connectionProfile, gatewayOptions);
            let user = gateway.getCurrentIdentity()
            return user

        } catch (err) {
            console.log('===== Err GetUserByIdentity', err)
        } finally {
            if (gateway) {
                gateway.disconnect()
            }
        }
    }

    // public async getFabricAdminWallet(): Promise<Wallet> {
    //     const adminReady = await this.wallet.exists('admin');
    //     if (!adminReady) {
    //         const caKeys = Object.keys(connectionProfile.certificateAuthorities);
    //         const caUrl = connectionProfile.certificateAuthorities[caKeys[0]].url;
    //         let caService = new FabricCAServices(caUrl);
    //         let registrarId = 'admin'
    //         let registrarPw = 'adminpw'
    //         const enrollment = await caService.enroll({ enrollmentID: registrarId, enrollmentSecret: registrarPw });
    //         let client = FabricClient.loadFromConfig(connectionProfile);
    //         const mspID = client.getMspid();
    //         const cert = enrollment.certificate;
    //         const key = enrollment.key.toBytes();
    //         const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //         await this.wallet.import('admin', identity);
    //     }
    //     return this.wallet
    // }

    // async createAdminUser(userName, secrect, description, attrs): Promise<{ identity: Identity, error: any }> {
    //     return await this.createFabricUserWithRole(userName, secrect, 'admin', attrs)
    // }

    // async getIdentityByIdAndSecrect(enrollmentID: string, enrollmentSecrect: string): Promise<Identity> {
    //     try {
    //         const caKeys = Object.keys(connectionProfile.certificateAuthorities);
    //         const caUrl = connectionProfile.certificateAuthorities[caKeys[0]].url;
    //         let caService = new FabricCAServices(caUrl);
    //         let registrarId = enrollmentID
    //         let registrarPw = enrollmentSecrect
    //         const enrollment = await caService.enroll({ enrollmentID: registrarId, enrollmentSecret: registrarPw });
    //         let client = FabricClient.loadFromConfig(connectionProfile);
    //         const mspID = client.getMspid();
    //         const cert = enrollment.certificate;
    //         const key = enrollment.key.toBytes();
    //         const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //         return identity
    //     } catch (err) {
    //         console.log('===== ERROR getIdentityByIdAndSecreact', err)
    //         throw err
    //     }
    // }


    // async createFabricUserWithRole(userName, password, role, attrs): Promise<{ identity: Identity, error: any }> {
    //     let gateway: Gateway
    //     const wallet = this.wallet
    //     try {
    //         const adminReady = await wallet.exists('admin');
    //         if (!adminReady) {
    //             const caKeys = Object.keys(connectionProfile.certificateAuthorities);
    //             const caUrl = connectionProfile.certificateAuthorities[caKeys[0]].url;
    //             let caService = new FabricCAServices(caUrl);
    //             let registrarId = 'admin'
    //             let registrarPw = 'adminpw'
    //             const enrollment = await caService.enroll({ enrollmentID: registrarId, enrollmentSecret: registrarPw });
    //             let client = FabricClient.loadFromConfig(connectionProfile);
    //             const mspID = client.getMspid();
    //             const cert = enrollment.certificate;
    //             const key = enrollment.key.toBytes();
    //             const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //             await wallet.import('admin', identity);
    //         }
    //         const gatewayOptions = {
    //             identity: 'admin',
    //             wallet,
    //             discovery: {
    //                 enabled: true,
    //                 asLocalhost: true
    //             }
    //         };
    //         gateway = new Gateway();
    //         await gateway.connect(connectionProfile, gatewayOptions);
    //         let client = gateway.getClient();
    //         let ca = client.getCertificateAuthority();

    //         let registrar = gateway.getCurrentIdentity();
    //         const registrationRequest = {
    //             enrollmentID: userName,
    //             enrollmentSecret: password,
    //             affiliation: '',
    //             maxEnrollments: 0,
    //             role: role,
    //             attrs: attrs
    //         };

    //         const registerResult = await ca.register(registrationRequest, registrar);
    //         const enrollmentRequest = {
    //             enrollmentID: userName,
    //             enrollmentSecret: password
    //         };
    //         const enrollment = await ca.enroll(enrollmentRequest);
    //         const mspID = client.getMspid();
    //         const cert = enrollment.certificate;
    //         const key = enrollment.key.toBytes();
    //         const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //         // await wallet.import(userName, identity);

    //         gateway.disconnect();
    //         return { identity: identity, error: null }
    //     }
    //     catch (err) {
    //         console.log('====== error createFabricUser', err)
    //         if (gateway) {
    //             gateway.disconnect();
    //         }
    //         return { identity: undefined, error: err }
    //     }
    // }


    // async createFabricUserWithWallet(userName, password, email, adminWallet, adminName): Promise<{ identity: Identity }> {
    //     let gateway: Gateway
    //     const gatewayOptions = {
    //         identity: adminName,
    //         wallet: adminWallet,
    //         discovery: {
    //             enabled: true,
    //             asLocalhost: true
    //         }
    //     };
    //     gateway = new Gateway();
    //     await gateway.connect(connectionProfile, gatewayOptions);
    //     let client = gateway.getClient();
    //     let ca = client.getCertificateAuthority();
    //     let registrar = gateway.getCurrentIdentity();
    //     const registrationRequest = {
    //         enrollmentID: userName,
    //         enrollmentSecret: password,
    //         affiliation: '',
    //         maxEnrollments: 0,
    //         role: 'client'
    //     };
    //     await ca.register(registrationRequest, registrar);
    //     const enrollmentRequest = {
    //         enrollmentID: userName,
    //         enrollmentSecret: password
    //     };
    //     const enrollment = await ca.enroll(enrollmentRequest);
    //     const mspID = client.getMspid();
    //     const cert = enrollment.certificate;
    //     const key = enrollment.key.toBytes();
    //     const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //     gateway.disconnect();
    //     return { identity: identity }
    // }

    // async createFabricUser(userName, password) {
    //     let gateway: Gateway
    //     const wallet = this.wallet
    //     try {
    //         const adminReady = await wallet.exists('admin');
    //         if (!adminReady) {
    //             const caKeys = Object.keys(connectionProfile.certificateAuthorities);
    //             const caUrl = connectionProfile.certificateAuthorities[caKeys[0]].url;
    //             let caService = new FabricCAServices(caUrl);
    //             let registrarId = 'admin'
    //             let registrarPw = 'adminpw'
    //             const enrollment = await caService.enroll({ enrollmentID: registrarId, enrollmentSecret: registrarPw });
    //             let client = FabricClient.loadFromConfig(connectionProfile);
    //             const mspID = client.getMspid();
    //             const cert = enrollment.certificate;
    //             const key = enrollment.key.toBytes();
    //             const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //             await wallet.import('admin', identity);
    //         }
    //         const gatewayOptions = {
    //             identity: 'admin',
    //             wallet,
    //             discovery: {
    //                 enabled: true,
    //                 asLocalhost: true
    //             }
    //         };
    //         gateway = new Gateway();
    //         await gateway.connect(connectionProfile, gatewayOptions);
    //         let client = gateway.getClient();
    //         let ca = client.getCertificateAuthority();

    //         let registrar = gateway.getCurrentIdentity();
    //         const registrationRequest = {
    //             enrollmentID: userName,
    //             enrollmentSecret: password,
    //             affiliation: '',
    //             maxEnrollments: 0,
    //             role: 'client'
    //         };

    //         await ca.register(registrationRequest, registrar);
    //         const enrollmentRequest = {
    //             enrollmentID: userName,
    //             enrollmentSecret: password
    //         };
    //         const enrollment = await ca.enroll(enrollmentRequest);
    //         const mspID = client.getMspid();
    //         const cert = enrollment.certificate;
    //         const key = enrollment.key.toBytes();
    //         const identity = X509WalletMixin.createIdentity(mspID, cert, key);
    //         await wallet.import(userName, identity);

    //         gateway.disconnect();
    //         return { identity: identity }
    //     }
    //     catch (err) {
    //         console.log('====== error createFabricUser', err)
    //         if (gateway) {
    //             gateway.disconnect();
    //         }
    //         return { identity: undefined, error: err }
    //     }
    // }

    public async chaincodeInvokeByAdminOrg(invokeRequest: InvokeRequest) {
        return await this.chaincodeInvoke(this.organizationAdmin, invokeRequest, this.wallet)
    }
    public async chaincodeInvoke(userName: string, invokeRequest: InvokeRequest, wallet: Wallet) {
        const ccID = invokeRequest.chaincodeID;
        let gateway: Gateway;
        try {
            const gatewayOptions = {
                identity: userName,
                wallet: wallet,
                discovery: {
                    enabled: true,
                    asLocalhost: true
                }
            };
            gateway = new Gateway();
            await gateway.connect(connectionProfile, gatewayOptions);
            const network = await gateway.getNetwork('ch1');
            const contract = network.getContract(ccID);
            const argument: string[] = Object.values<string>(invokeRequest.args)
            const result = await contract.submitTransaction(invokeRequest.functionName, ...argument);
            return result
        }
        catch (err) {
            return Promise.reject(err);
        }
        finally {
            if (gateway)
                gateway.disconnect();
        }
    }

    // async chainCodeQuery(userName: string, queryRequest, wallet: Wallet) {
    //     const ccID = queryRequest.chaincodeID;
    //     let gateway: Gateway;
    //     try {
    //         const gatewayOptions = {
    //             identity: userName,
    //             wallet: wallet,
    //             discovery: {
    //                 enabled: true,
    //                 asLocalhost: true
    //             }
    //         };
    //         gateway = new Gateway();
    //         await gateway.connect(connectionProfile, gatewayOptions);
    //         const network = await gateway.getNetwork('ch1');
    //         const contract = network.getContract(ccID);
    //         const argument: string[] = Object.values<string>(queryRequest.args)

    //         const result = await contract.evaluateTransaction(queryRequest.functionName, ...argument);
    //         console.log('===== result Chaincode querry ', result)
    //         return Promise.resolve(result);
    //     } catch (err) {
    //         console.log('===== errr chainCodeQuery ', err)
    //         return Promise.reject(err);
    //     } finally {
    //         if (gateway)
    //             gateway.disconnect();
    //     }
    // }
}
export interface InvokeRequest {
    chaincodeID: string;
    functionName: string;
    args: any
}