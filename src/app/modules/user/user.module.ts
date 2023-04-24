import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongoService } from '../../db/db';

@Module({
  controllers: [UserController],
  providers: [UserService, MongoService],
})
export class UserModule {}
