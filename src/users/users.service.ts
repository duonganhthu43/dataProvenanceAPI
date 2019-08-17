import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
const jwt = require('jsonwebtoken');
import { SECRET } from '../../config';
import { UserRO, UserWithFabricCredential } from './users.interface';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { InMemoryWallet, X509WalletMixin, Identity } from 'fabric-network';
import { CreateUserDTO } from './dto/CreateUserDTO';
import { FabricService } from '../fabric/fabric.service';
import { UserWalletService } from '../user-wallet/user-wallet.service';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class UsersService {
  constructor(private fabricService: FabricService, private userWalletService: UserWalletService, private authService: AuthService
  ) { }

  async createUser(userData: CreateUserDTO) {
    try {
      const newMemberWallet = await this.fabricService.createOrgMember(userData)
      let newMemberIdentity = await this.fabricService.getUserByIdentity(userData.username, newMemberWallet);
      const createAsMemberBuffer = await this.fabricService.chaincodeInvoke(userData.username, {
        chaincodeID: 'participant',
        functionName: 'participant_create',
        args: {
          param: `{"username": "${userData.username}", "name": "${userData.username}", "passwordHash": "${userData.password}", "email": "${userData.email}" }`
        }
      }, newMemberWallet)
      let participantId = createAsMemberBuffer.toString()
      const register = await this.fabricService.chaincodeInvokeByAdminOrg({
        chaincodeID: 'participant',
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
        organization: participantRegisterd['_organization']
      }
      let userCreated = await this.userWalletService.createUser(newUser)
      return userCreated

    } catch (err) {
      throw new HttpException({ message: err }, HttpStatus.BAD_REQUEST);
    }
  }

  async login(loginInfo: { username: string, password: string }) {
    if (!loginInfo) throw new HttpException({ message: 'LoginInfo is null' }, 400)
    return await this.authService.login(loginInfo)
  }
  async getUserByUserNamePWD({ username, password }) {
    return await this.userWalletService.findByUserNamePassord({ username, password })
  }

}
