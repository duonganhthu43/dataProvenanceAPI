import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterLoad } from "typeorm";
import { IsEmail, Validate } from 'class-validator';
import * as crypto from 'crypto';
import { Identity, InMemoryWallet } from "fabric-network";
import { FabricService } from "../fabric/fabric.service";

@Entity('wallet')
export class UserWalletEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @Column("simple-json")
  fabricIdentity: Identity;

  @Column("simple-array")
  organization: string[];

  @Column("simple-json", {nullable: true})
  attributes: any

  wallet: InMemoryWallet
  
  @AfterLoad()
  async loadWallet() {
    this.wallet =  await FabricService.createWalletFromFabricIdentity(this.username, this.fabricIdentity)
  }
}
