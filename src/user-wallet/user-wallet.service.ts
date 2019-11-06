import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { UserWalletEntity } from './user-wallet.entity';
// import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
const jwt = require('jsonwebtoken');
import { SECRET } from '../../config';
// import { UserRO, UserWithFabricCredential } from './users.interface';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { InMemoryWallet, X509WalletMixin, Identity } from 'fabric-network';

@Injectable()
export class UserWalletService {
  constructor(
    @InjectRepository(UserWalletEntity)
    private readonly userWalletRepository: Repository<UserWalletEntity>,
  ) { }

  async createUser(dto: { username: string, password: string, email: string, fabricIdentity: any, organization: string, attributes: any }): Promise<UserWalletEntity> {
    const { username, password, email, fabricIdentity, organization, attributes } = dto
    const querry = await getRepository(UserWalletEntity)
      .createQueryBuilder('user')
      .where('user.username = :username', { username }).orWhere('user.email = :email', { email })
    const userByUserNameOrEmail = await querry.getOne()
    // if (userByUserNameOrEmail) {
    //   const errors = { username: 'Username and email must be unique.' };
    //   throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);
    // }
    // create new user 
    let newUser: UserWalletEntity;
    if (userByUserNameOrEmail) {
      newUser = userByUserNameOrEmail
    } else {
      newUser = new UserWalletEntity()
    }

    newUser.username = username;
    newUser.password = crypto.createHmac('sha256', password).digest('hex')
    newUser.email = email
    newUser.fabricIdentity = fabricIdentity
    newUser.organization = [organization]
    newUser.attributes = attributes
    const errors = await validate(newUser);
    if (errors.length > 0) {
      const _errors = { username: 'Userinput is not valid.' };
      throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);
    } else {
      const savedUser = await this.userWalletRepository.save(newUser);
      return savedUser
    }
  }

  //   async create(dto: CreateUserDto): Promise<UserRO> {
  //     try {
  //       // check uniqueness of username/email
  //       const { username, email, password, fabricIdentity } = dto;
  //       const qb = await getRepository(UserWalletEntity)
  //         .createQueryBuilder('user')
  //         .where('user.username = :username', { username })
  //         .orWhere('user.email = :email', { email });
  //       const user = await qb.getOne();

  //       if (user) {
  //         const errors = { username: 'Username and email must be unique.' };
  //         throw new HttpException({ message: 'Input data validation failed', errors }, HttpStatus.BAD_REQUEST);
  //       }

  //       // create new user
  //       let newUser = new UserWalletEntity();
  //       newUser.username = username;
  //       newUser.email = email;
  //       newUser.password = password;
  //       newUser.fabricIdentity = JSON.stringify(fabricIdentity)

  //       const errors = await validate(newUser);
  //       if (errors.length > 0) {
  //         const _errors = { username: 'Userinput is not valid.' };
  //         throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);

  //       } else {
  //         const savedUser = await this.userWalletRepository.save(newUser);
  //         return this.buildUserRO(savedUser);
  //       }
  //     }
  //     catch (err) {
  //       throw new HttpException({ message: 'Error has occured ', err }, HttpStatus.BAD_REQUEST);
  //     }
  //   }
  //   async createUserEntity(entity: UserEntity): Promise<boolean> {
  //     try {
  //       const errors = await validate(entity);
  //       if (errors.length > 0) {
  //         const _errors = { username: 'Userinput is not valid.' };
  //         throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);
  //       } else {
  //         const savedUser = await this.userRepository.save(entity);
  //         return true
  //       }
  //     }
  //     catch (err) {
  //       throw new HttpException({ message: 'Error has occured ', err }, HttpStatus.BAD_REQUEST);
  //     }
  //   }


  //   async findAll(): Promise<UserEntity[]> {
  //     return await this.userRepository.find();
  //   }

  //   async findOne(loginUserDto: LoginUserDto): Promise<UserEntity> {
  //     const findOneOptions = {
  //       email: loginUserDto.email,
  //       password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
  //     };
  //     return await this.userRepository.findOne(findOneOptions);
  //   }

  async findByUserNamePassord({ username, password }): Promise<UserWalletEntity> {
    const findOneOptions = {
      username: username,
      password: password,
    };

    return await this.userWalletRepository.findOne(findOneOptions);
  }
  //   async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
  //     let toUpdate = await this.userRepository.findOne(id);
  //     delete toUpdate.password;
  //     let updated = Object.assign(toUpdate, dto);
  //     return await this.userRepository.save(updated);
  //   }

  //   async delete(email: string): Promise<DeleteResult> {
  //     return await this.userRepository.delete({ email: email });
  //   }

  //   async findByClientID(clientId: string): Promise<UserWithFabricCredential> {
  //     const qb = await getRepository(UserEntity)
  //       .createQueryBuilder('user')
  //       .where('user.username = :clientId', { clientId });
  //     const user = await qb.getOne();
  //     return await this.buidUserWithFabricCredential(user);
  //   }
  //   async findById(id: number): Promise<UserWithFabricCredential> {
  //     const user = await this.userRepository.findOne(id);
  //     if (!user) {
  //       const errors = { User: ' not found' };
  //       throw new HttpException({ errors }, 401);
  //     };
  //     return await this.buidUserWithFabricCredential(user);
  //   }

  //   async findByEmail(email: string): Promise<UserRO> {
  //     const user = await this.userRepository.findOne({ email: email });
  //     return this.buildUserRO(user);
  //   }

  //   public generateJWT(user) {
  //     let today = new Date();
  //     let exp = new Date(today);
  //     exp.setDate(today.getDate() + 60);

  //     return jwt.sign({
  //       id: user.id,
  //       username: user.username,
  //       email: user.email,
  //       exp: exp.getTime() / 1000,
  //     }, SECRET);
  //   };

  //    public buildUserRO(user: UserEntity) {
  //     const userRO = {
  //       username: user.username,
  //       email: user.email,
  //       token: this.generateJWT(user),
  //     };

  //     return { user: userRO };
  //   }



  //   public async buidUserWithFabricCredential(user: UserEntity): Promise<UserWithFabricCredential> {

  //     let wallet: InMemoryWallet = new InMemoryWallet()
  //     let fabricIdentiy = JSON.parse(user.fabricIdentity)
  //     let myIndentity = X509WalletMixin.createIdentity(fabricIdentiy.mspId, fabricIdentiy.certificate, fabricIdentiy.privateKey)
  //     await wallet.import(user.username, myIndentity)
  //     const userRO = {
  //       username: user.username,
  //       email: user.email,
  //       token: this.generateJWT(user),
  //       wallet: wallet
  //     };
  //     return userRO;
  //   }
}
