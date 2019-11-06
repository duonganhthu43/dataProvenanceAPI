import { Controller, UsePipes, Post, Body, UseGuards, Request, Get, Res, Header } from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { CreateUserDTO } from './dto/CreateUserDTO';
import { AuthGuard } from '@nestjs/passport';
import { FabricService } from '../fabric/fabric.service';
import { UserCriteria } from './dto/UserCriteria';
import { InMemoryWallet } from 'fabric-network';
import { UserWalletService } from '../user-wallet/user-wallet.service';
import { Response } from 'express';
import { join } from 'path';
import { ActivatedUser } from './dto/ActivatedUser';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService, private userWalletSerivce: UserWalletService, private readonly fabricService: FabricService) { }
  @Post('createActivateUser')
  async createActivateUser(@Body() userData: ActivatedUser) {
    console.log('==== userData', userData)
    let fabricUserWallet: InMemoryWallet = await this.fabricService.createFabricUser({ username: userData.username, password: userData.password })
    let identity = await fabricUserWallet.export(userData.username)
    let fingerprint = FabricService.getFingerPrintFromCertPEM(identity["certificate"])
    let userAfterUpdatedBuffer = await this.userService.createActivatedUser({ ...userData, fingerprint })
    if (userAfterUpdatedBuffer) {
      let value = await this.userWalletSerivce.createUser({ username: userData.username, password: userData.password, email: userData.email, fabricIdentity: identity, organization: 'org1', attributes: [] })
      return { ...value, fingerprint }
    }
    throw Error('Cannot create active user');
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

    // let resultSubmited =  await this.submitDataToBC(userData, 'user_create')


    // if (!userCriteria) { throw new Error('Input criteria is null') }
    // let userResultBuffer = await this.userService.queryUserOnBC(userCriteria)
    // let jsonValue = JSON.parse(userResultBuffer.toString())
    // if (jsonValue && jsonValue.userData) {
    //   let userData = jsonValue.userData
    //   let fabricUserWallet: InMemoryWallet = await this.fabricService.createFabricUser({ username: userCriteria.email, password: userCriteria.apikey })
    //   let identity = await fabricUserWallet.export(userCriteria.email)
    //   let fingerprint = FabricService.getFingerPrintFromCertPEM(identity["certificate"])
    //   let userAfterUpdatedBuffer = await this.userService.updateUserIdentities({ userId: jsonValue['id'], fingerprint })
    //   if (userAfterUpdatedBuffer) {
    //     let value = await this.userWalletSerivce.createUser({ username: userCriteria.email, password: userCriteria.apikey, email: userCriteria.email, fabricIdentity: identity, organization: 'org1', attributes: [] })
    //     return value
    //   }
    // }
    // return jsonValue
  }
  @Post('generateCertificate')
  async generateCertificate(@Body() userCriteria: UserCriteria) {
    if (!userCriteria) { throw new Error('Input criteria is null') }
    let userResultBuffer = await this.userService.queryUserOnBC(userCriteria)
    let jsonValue = JSON.parse(userResultBuffer.toString())
    if (jsonValue && jsonValue.userData) {
      let userData = jsonValue.userData
      let fabricUserWallet: InMemoryWallet = await this.fabricService.createFabricUser({ username: userCriteria.email, password: userCriteria.apikey })
      let identity = await fabricUserWallet.export(userCriteria.email)
      let fingerprint = FabricService.getFingerPrintFromCertPEM(identity["certificate"])
      let userAfterUpdatedBuffer = await this.userService.updateUserIdentities({ userId: jsonValue['id'], fingerprint })
      if (userAfterUpdatedBuffer) {
        let value = await this.userWalletSerivce.createUser({ username: userCriteria.email, password: userCriteria.apikey, email: userCriteria.email, fabricIdentity: identity, organization: 'org1', attributes: [] })
        return value
      }
    }
    return jsonValue
  }
  @UsePipes(new ValidationPipe())
  @Post('create')
  async create(@Body() userData: CreateUserDTO) {
    return await this.userService.createUser(userData)
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const { username, password } = req.user
    let info = await this.userService.chaincodeQuerryCurrentUser(req.user.wallet, req.user.username)
    let accessToken = await this.userService.login({ username, password });
    return { ...JSON.parse(info.toString()), ...accessToken }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req) {
    let info = await this.userService.chaincodeQuerryCurrentUser(req.user.currentUser.wallet, req.user.username)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('getInfoByFingerprint')
  async getInfoByFingerprint(@Request() req, @Body() fingerprint) {
    let info = await this.userService.chaincodeQuerryUserByFingerPrint(req.user.currentUser.wallet, req.user.username, fingerprint)
    return JSON.parse(info.toString())
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('dataset')
  async getDataset(@Request() req) {
    let info = await this.userService.getDatasetFromBC(req.user.currentUser.wallet, req.user.username)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('dataset')
  async getDatasetById(@Request() req, @Body() dataset_id: any) {
    const { datasetId } = dataset_id
    let info = await this.userService.getDatasetById(req.user.currentUser.wallet, req.user.username, datasetId)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('dataset/new')
  async createNewDataset(@Request() req, @Body() newDataset: any) {
    let info = await this.userService.createNewDataset(req.user.currentUser.wallet, req.user.username, newDataset)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('dataset/update')
  async updateDataset(@Request() req, @Body() updatedDataset: any) {
    let info = await this.userService.updateDataset(req.user.currentUser.wallet, req.user.username, updatedDataset)
    return JSON.parse(info.toString())
  }



  @UseGuards(AuthGuard('jwt'))
  @Post('dataset/history')
  async getDatasetHistory(@Request() req, @Body() dataset_id: string) {
    let info = await this.userService.getDatasetHistory(req.user.currentUser.wallet, req.user.username, dataset_id)
    return JSON.parse(info.toString())
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('resources/create_multiple')
  async createMultipleResources(@Request() req, @Body() resources: any) {
    let info = await this.userService.createMultipleResources(req.user.currentUser.wallet, req.user.username, resources)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resources/batchUpdate')
  async batchUpdateDataset(@Request() req, @Body() batchDatasetUpdated: any) {
    let info = await this.userService.batchUpdateResources(req.user.currentUser.wallet, req.user.username, batchDatasetUpdated)
    return JSON.parse(info.toString())
  }
  @UseGuards(AuthGuard('jwt'))
  @Post('resource/history')
  async getResourceHistory(@Request() req, @Body() resource_id: string) {
    let info = await this.userService.getResourceHistory(req.user.currentUser.wallet, req.user.username, resource_id)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('dataset/provenance')
  async getDatasetProvenance(@Request() req, @Body() dataset_id: string) {
    let info = await this.userService.getDatasetProvenance(req.user.currentUser.wallet, req.user.username, dataset_id)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resource/provenance')
  async resourceProvenance(@Request() req, @Body() resource_id: string) {
    let info = await this.userService.getResourceProvenance(req.user.currentUser.wallet, req.user.username, resource_id)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resource')
  async getResourceById(@Request() req, @Body() resource_id: string) {
    let info = await this.userService.getResourcesId(req.user.currentUser.wallet, req.user.username, resource_id)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('resources')
  async getResources(@Request() req, @Body() package_id: string) {
    let info = await this.userService.getResourcesByPackageId(req.user.currentUser.wallet, req.user.username, package_id)
    return JSON.parse(info.toString())
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('resources')
  async getResourcesCurrentUser(@Request() req, @Body() package_id: string) {
    let info = await this.userService.getResourcesByPackageId(req.user.currentUser.wallet, req.user.username, package_id)
    return JSON.parse(info.toString())
  }

  @Post('generateSvgProv')
  async generateSvgProv(@Body() jsonProv: any) {
    return UsersService.generateSvgProv(JSON.stringify(jsonProv))
  }

  @Post('generateProvN')
  async generateProvN(@Body() jsonProv: any) {
    return UsersService.generateProvN(JSON.stringify(jsonProv))
  }


  @Post('generateProvPDF')
  @Header('Content-Type', 'application/pdf')
  async generateProvPDF(@Body() jsonProv: any, @Res() res: Response) {
    let fileName = await UsersService.generatePDFProv(JSON.stringify(jsonProv))
    res.sendFile(`/Users/yojee/Documents/GitHub/data-provenance-api/${fileName}`, (err) => {
      if (!err) {
        // delete file
        UsersService.deleteFile(fileName)
      }
    })
    return res
  }

  @Get('checkPython')
  async getPythonResult() {
    return UsersService.testPython()
  }
}
