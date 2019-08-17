import { Controller, UsePipes, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { CreateUserDTO } from './dto/CreateUserDTO';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  @UsePipes(new ValidationPipe())
  @Post('create')
  async create(@Body() userData: CreateUserDTO) {
    return await this.userService.createUser(userData)
  }


  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const { username, password } = req.user
    // return this.userService.
    return this.userService.login({ username, password });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req) {
  
    return await this.userService.getUserByUserNamePWD(req.user);
  }
}
