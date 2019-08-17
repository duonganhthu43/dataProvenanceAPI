import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import { IsEmail, Validate } from 'class-validator';
import * as crypto from 'crypto';

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
  fabricIdentity: {};

  @Column("simple-array")
  organization: string[];

  @Column("simple-json", {nullable: true})
  attributes: any
  
  @BeforeInsert()
  hashPassword() {
    console.log('==== hashPassword', crypto.createHmac('sha256', this.password).digest('hex'))
    console.log('==== hashPassword', this.password)

    this.password = crypto.createHmac('sha256', this.password).digest('hex');
  }
}
