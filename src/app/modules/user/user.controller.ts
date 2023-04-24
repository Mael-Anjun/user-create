import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async create(@Body() user: UserTypes): Promise<UserTypes> {
    const createdUser = await this.userService.createUser(user);
    const message = `Dear ${user.first_name},\n\nYour account has been created successfully!\n\nThanks,\nYour team.`;
    await this.userService.sendEmail(user.email, message);
    return createdUser;
  }

  @Get('user/:userid')
  async getUser(@Param('id') id: string): Promise<UserTypes> {
    const user = await this.userService.getById(id);
    return user;
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string): Promise<string> {
    const avatar = await this.userService.getAvatar(userId);
    return avatar;
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: number): Promise<string> {
    const deletedAvatar = await this.userService.deleteAvatar(userId);
    return deletedAvatar;
  }
}
