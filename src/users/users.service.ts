import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
const jwt = require('jsonwebtoken');
import { UserRO, UserWithFabricCredential } from './users.interface';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { InMemoryWallet, X509WalletMixin, Identity } from 'fabric-network';
import { CreateUserDTO } from './dto/CreateUserDTO';
import { FabricService } from '../fabric/fabric.service';
import { UserWalletService } from '../user-wallet/user-wallet.service';
import { AuthService } from '../auth/auth.service';
import { ChaincodeName } from '../constants'
import { UserCriteria } from './dto/UserCriteria';
import { PythonShell } from 'python-shell';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(private fabricService: FabricService, private userWalletService: UserWalletService, private authService: AuthService
  ) { }

  public static generateSvgProv(jsonProv) {
    return new Promise((resolve, reject) => {
      let options = {
        pythonPath: '/Users/yojee/PycharmProjects/testProv/venv/bin/python',
        pythonOptions: ['-u'], // get print results in real-time,
        args: [`${jsonProv}`]
      };
      PythonShell.run('./generateSvgProv.py', options, function (err, results) {
        if (err) return reject(err);
        return resolve(results.join(''));
      });
    })
  }

  public static deleteFile(fileName) {
    let options = {
      pythonPath: '/Users/yojee/PycharmProjects/testProv/venv/bin/python',
      pythonOptions: ['-u'], // get print results in real-time,
      args: [fileName]
    };
    PythonShell.run('./deleteFile.py', options, (err, results) => {
      console.log('====== delete done')
    })
  }

  public static generatePDFProv(jsonProv): Promise<string> {
    return new Promise((resolve, reject) => {
      let options = {
        pythonPath: '/Users/yojee/PycharmProjects/testProv/venv/bin/python',
        pythonOptions: ['-u'], // get print results in real-time,
        args: [`${jsonProv}`]
      };
      PythonShell.run('./generatePDF.py', options, function (err, results) {
        if (err) return reject(err);
        console.log(results.join(''))
        return resolve(results.join(''))
        // let stream = fs.createReadStream(`./${results.join('')}`)
        // stream.on('close', () => {
        //   let optionsFile = {
        //     pythonPath: '/Users/yojee/PycharmProjects/testProv/venv/bin/python',
        //     pythonOptions: ['-u'], // get print results in real-time,
        //     args: [`${results.join('')}`]
        //   };
        //   PythonShell.run('./deleteFile.py', optionsFile, (err, results) => {
        //     console.log('====== delete done')
        //   })
        // })
        // return resolve(stream)
        //bturttfguy.pdf
        // fs.readFile(`./${results.join('')}`, 'utf-8', ((err, data) => {
        //   if (err) {
        //     reject(err);
        //   } else {
        //     const httpResponseObjectArray = data;
        //     return resolve(httpResponseObjectArray);
        //   }
        // }))
        // return resolve(results.join(''));
      });
    })
  }

  public static generateProvN(jsonProv) {
    return new Promise((resolve, reject) => {
      let options = {
        pythonPath: '/Users/yojee/PycharmProjects/testProv/venv/bin/python',
        pythonOptions: ['-u'], // get print results in real-time,
        args: [`${jsonProv}`]
      };
      PythonShell.run('./generateProvN.py', options, function (err, results) {
        if (err) return reject(err);
        return resolve(results.join(''));
      });
    })
  }

  public static async testPython() {
    let text = `{
      "entity": {
          "prov:report2": {
              "prov:type": "report",
              "prov:version": 2
          },
          "prov:report1": {
              "prov:type": "report",
              "prov:version": 1
          },
          "prov:alice-bundle2": {
              "prov:type": {
                  "$": "prov:Bundle",
                  "type": "xsd:QName"
              }
          },
          "prov:bob-bundle1": {
              "prov:type": {
                  "$": "prov:Bundle",
                  "type": "xsd:QName"
              }
          }
      },
      "agent": {
        "prov:alice": {},
        "prov:bob": {}
      },
      "wasDerivedFrom": {
          "_:wDF1": {
              "prov:generatedEntity": "prov:report2",
              "prov:usedEntity": "prov:report1"
          }
      },
      "wasGeneratedBy": {
          "_:wGB1": {
              "prov:time": "2012-05-24T10:00:01",
              "prov:entity": "prov:report1"
          },
          "_:wGB2": {
              "prov:time": "2012-05-25T11:00:01",
              "prov:entity": "prov:report2"
          },
          "_:wGB3": {
              "prov:time": "2012-05-24T10:30:00",
              "prov:entity": "prov:bob-bundle1"
          },
          "_:wGB4": {
              "prov:time": "2012-05-25T11:15:00",
              "prov:entity": "prov:alice-bundle2"
          }
      },
      "wasAttributedTo": {
          "_:wAT1": {
              "prov:agent": "prov:alice",
              "prov:entity": "prov:alice-bundle2"
          },
          "_:wAT2": {
              "prov:agent": "prov:bob",
              "prov:entity": "prov:bob-bundle1"
          }
      },
      "bundle": {
          "prov:alice-bundle2": {
              "wasGeneratedBy": {
                  "_:wGB29": {
                      "prov:time": "2012-05-25T11:00:01",
                      "prov:entity": "prov:report2"
                  }
              },
              "entity": {
                  "prov:report2": {
                      "prov:type": "report",
                      "prov:version": 2
                  },
                  "prov:report1": {
                  }
              },
              "wasDerivedFrom": {
                  "_:wDF25": {
                      "prov:generatedEntity": "prov:report2",
                      "prov:usedEntity": "prov:report1"
                  }
              }
          },
          "prov:bob-bundle1": {
              "wasGeneratedBy": {
                  "_:wGB28": {
                      "prov:time": "2012-05-24T10:00:01",
                      "prov:entity": "prov:report1"
                  }
              },
              "entity": {
                  "prov:report1": {
                      "prov:type": "report",
                      "prov:version": 1
                  }
              }
          }
      }
  }`
    return new Promise((resolve, reject) => {
      let options = {
        pythonPath: '/Users/yojee/PycharmProjects/testProv/venv/bin/python',
        pythonOptions: ['-u'], // get print results in real-time,
        args: [text]
      };

      PythonShell.run('./generateSvgProv.py', options, function (err, results) {
        if (err) return reject(err);
        // results is an array consisting of messages collected during execution
        return resolve(results.join(''));
      });
    })

  }
  async createUser(userData: CreateUserDTO) {
    try {
      const newMemberWallet = await this.fabricService.createOrgMember(userData)
      let newMemberIdentity = await this.fabricService.getUserByIdentity(userData.username, newMemberWallet);
      const createAsMemberBuffer = await this.fabricService.chaincodeInvoke(userData.username, {
        chaincodeID: ChaincodeName,
        functionName: 'participant_create',
        args: {
          param: `{"username": "${userData.username}", "name": "${userData.username}", "passwordHash": "${userData.password}", "email": "${userData.email}" }`
        }
      }, newMemberWallet)
      let participantId = createAsMemberBuffer.toString()
      const register = await this.fabricService.chaincodeInvokeByAdminOrg({
        chaincodeID: ChaincodeName,
        functionName: 'participant_register',
        args: {
          param: participantId
        }
      })
      let participantRegisterd = JSON.parse(register.toString())
      const newUser = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        fabricIdentity: await newMemberWallet.export(userData.username),
        organization: participantRegisterd['_organization'],
        attributes: []
      }
      let userCreated = await this.userWalletService.createUser(newUser)
      return userCreated

    } catch (err) {
      throw new HttpException({ message: err }, HttpStatus.BAD_REQUEST);
    }
  }

  async queryUserOnBC(userCriteria: UserCriteria): Promise<any> {
    return await this.fabricService.chaincodeQuerryByAdminOrg({
      chaincodeID: ChaincodeName,
      functionName: 'user_query',
      args: {
        param: `${this.stringifyValue(userCriteria)}`
      }
    })
  }

  async createActivatedUser(userInfo): Promise<any> {
    return await this.fabricService.chaincodeInvokeByAdminOrg({
      chaincodeID: ChaincodeName,
      functionName: 'user_createActivatedUser',
      args: {
        param: `${this.stringifyValue(userInfo)}`
      }
    })
  }

  async updateUserIdentities({ userId, fingerprint }): Promise<any> {
    return await this.fabricService.chaincodeInvokeByAdminOrg({
      chaincodeID: ChaincodeName,
      functionName: 'user_updateUserIdentities',
      args: {
        param: `${this.stringifyValue({ userId, fingerprint })}`
      }
    })
  }

  async login(loginInfo: { username: string, password: string }) {
    if (!loginInfo) throw new HttpException({ message: 'LoginInfo is null' }, 400)
    return await this.authService.login(loginInfo)
  }
  async getUserByUserNamePWD({ username, password }) {
    return await this.userWalletService.findByUserNamePassord({ username, password })
  }
  private stringifyValue(inpuValue: any) {
    return JSON.stringify(inpuValue, (key, value) => { if (value !== null) return value })
  }

  async chaincodeQuerryCurrentUser(wallet: InMemoryWallet, username: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'user_me',
      args: {
        param: ``
      }
    }, wallet)
  }

  async chaincodeQuerryUserByFingerPrint(wallet: InMemoryWallet, username: string, fingerprint: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'user_getbyfingerprint',
      args: {
        param: `${this.stringifyValue(fingerprint)}`
      }
    }, wallet)
  }


  async getDatasetFromBC(wallet: InMemoryWallet, username: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'dataset_getlist',
      args: {
        param: ``
      }
    }, wallet)
  }
  async createNewDataset(wallet: InMemoryWallet, username: string, datasetInfo: any) {
    return await this.submitDataToBC(wallet, username, datasetInfo, 'dataset_create')
  }

  async updateDataset(wallet: InMemoryWallet, username: string, datasetInfo: any) {
    return await this.submitDataToBC(wallet, username, datasetInfo, 'dataset_update')
  }

  async batchUpdateResources(wallet: InMemoryWallet, username: string, resources: any) {
    return await this.submitDataToBC(wallet, username, resources, 'resource_batch_update')
  }

  async createMultipleResources(wallet: InMemoryWallet, username: string, datasetInfo: []) {
    return await this.submitDataToBC(wallet, username, { resources: datasetInfo }, 'resource_create_multiple')
  }

  async createResources(wallet: InMemoryWallet, username: string, resources: any) {
    return await this.submitDataToBC(wallet, username, resources, 'resource_update')
  }

  async getDatasetById(wallet: InMemoryWallet, username: string, dataset_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'dataset_getbyid',
      args: {
        param: `${this.stringifyValue({ dataset_id: dataset_id })}`
      }
    }, wallet)
  }

  async getDatasetHistory(wallet: InMemoryWallet, username: string, dataset_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'dataset_gethistory',
      args: {
        param: `${this.stringifyValue(dataset_id)}`
      }
    }, wallet)
  }

  async getResourceHistory(wallet: InMemoryWallet, username: string, resource_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'resource_gethistory',
      args: {
        param: `${this.stringifyValue(resource_id)}`
      }
    }, wallet)
  }

  async getDatasetProvenance(wallet: InMemoryWallet, username: string, dataset_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'dataset_getprovenance',
      args: {
        param: `${this.stringifyValue(dataset_id)}`
      }
    }, wallet)
  }

  async getResourceProvenance(wallet: InMemoryWallet, username: string, resource_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'resource_getprovenance',
      args: {
        param: `${this.stringifyValue(resource_id)}`
      }
    }, wallet)
  }

  async getResourcesByPackageId(wallet: InMemoryWallet, username: string, package_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'resource_getbypackageid',
      args: {
        param: `${this.stringifyValue(package_id)}`
      }
    }, wallet)
  }

  async getResourcesId(wallet: InMemoryWallet, username: string, resource_id: string) {
    return await this.fabricService.chainCodeQuery(username, {
      chaincodeID: ChaincodeName,
      functionName: 'resource_getbyid',
      args: {
        param: `${this.stringifyValue(resource_id)}`
      }
    }, wallet)
  }

  private async submitDataToBC(wallet: InMemoryWallet, username: string, data: any, funcName: string) {
    try {
      const dataSubmited = await this.fabricService.chaincodeInvoke(username, {
        chaincodeID: ChaincodeName,
        functionName: funcName,
        args: {
          param: `${this.stringifyValue(data)}`
        }
      }, wallet)
      let result = dataSubmited.toString()
      return result
    } catch (err) {
      throw new HttpException({ message: err }, HttpStatus.BAD_REQUEST);
    }
  }



}
