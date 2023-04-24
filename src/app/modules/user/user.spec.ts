import { Test, type TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { MongoService } from '../../db/db';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [UserService, MongoService], // fornecendo o MongoService aqui
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user: UserTypes = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://reqres.in/img/faces/2-image.jpg',
        id: 0,
      };

      const createdUser = {
        id: 23,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password123',
        avatar: 'https://reqres.in/img/faces/2-image.jpg',
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);

      const result = await userService.createUser(user);

      expect(result).toEqual(createdUser);
    });
  });

  describe('getById', () => {
    it('should retrieve a user by ID', async () => {
      const userId = '2';
      const expectedUser = {
        id: 2,
        email: 'janet.weaver@reqres.in',
        first_name: 'Janet',
        last_name: 'Weaver',
        avatar: 'https://reqres.in/img/faces/2-image.jpg',
      };

      jest.spyOn(userService, 'getById').mockResolvedValue(expectedUser);

      const result = await userService.getById(userId);

      expect(result).toEqual(expectedUser);
    });
  });

  describe('getAvatar', () => {
    it('should return the user avatar when the image file already exists', async () => {
      const userId = '123';
      const imagePath = `./avatars/${crypto
        .createHash('md5')
        .update(userId)
        .digest('hex')}.jpg`;
      const expectedAvatar = 'base64-encoded-image';

      jest.mock('fs', () => ({
        existsSync: jest.fn().mockReturnValueOnce(true),
      }));
      jest
        .spyOn(fs, 'readFileSync')
        .mockReturnValueOnce(Buffer.from(expectedAvatar, 'base64'));

      const result = await userService.getAvatar(userId);

      expect(result).toEqual(expectedAvatar);
      expect(fs.existsSync).toHaveBeenCalledWith(imagePath);
      expect(fs.readFileSync).toHaveBeenCalledWith(imagePath);
    });

    it('should return the user avatar when the image file does not exist and is retrieved from the database', async () => {
      const userId = '123';
      const imagePath = `./avatars/${crypto
        .createHash('md5')
        .update(userId)
        .digest('hex')}.jpg`;
      const expectedAvatar = 'base64-encoded-image';
      const expectedUser = { id: userId, avatar: expectedAvatar };

      const existsSyncSpy = jest
        .spyOn(fs, 'existsSync')
        .mockReturnValueOnce(false);
      const findOneSpy = jest.fn().mockResolvedValueOnce(expectedUser);
      const getDbSpy = jest
        .spyOn(userService.mongoService, 'getDb')
        .mockResolvedValueOnce({
          collection: jest.fn().mockReturnValueOnce({
            findOne: findOneSpy,
          }),
        } as any);
      const writeFileSyncSpy = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementationOnce(() => {});
      const bufferFromSpy = jest
        .spyOn(Buffer.prototype, 'from')
        .mockReturnValueOnce(expectedAvatar);

      const result = await userService.getAvatar(userId);

      expect(result).toEqual(expectedAvatar);
      expect(existsSyncSpy).toHaveBeenCalledWith(imagePath);
      expect(getDbSpy).toHaveBeenCalled();
      expect(findOneSpy).toHaveBeenCalledWith({ id: userId });
      expect(writeFileSyncSpy).toHaveBeenCalledWith(
        imagePath,
        Buffer.from(expectedAvatar, 'base64'),
      );
      expect(bufferFromSpy).toHaveBeenCalledWith(expectedAvatar, 'base64');
    });

    it('should return "error" when the user does not have an avatar', async () => {
      const userId = '123';
      const expectedUser = { id: userId };

      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
      jest.spyOn(userService.mongoService, 'getDb').mockResolvedValueOnce({
        collection: jest.fn().mockReturnValueOnce({
          findOne: jest.fn().mockResolvedValueOnce(expectedUser),
        }),
      } as any);

      const result = await userService.getAvatar(userId);

      expect(result).toEqual('error');
      expect(fs.existsSync).toHaveBeenCalled();
      expect(userService.mongoService.getDb).toHaveBeenCalled();
    });
  });
});
