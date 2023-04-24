import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongoService } from '../../db/db';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, MongoService],
    }).compile();

    controller = moduleRef.get<UserController>(UserController);
    service = moduleRef.get<UserService>(UserService);
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and return success message', async () => {
      const userId = 1;
      const deletedAvatarMessage = 'Avatar deleted successfully';

      jest
        .spyOn(service, 'deleteAvatar')
        .mockResolvedValue(deletedAvatarMessage);

      const result = await controller.deleteAvatar(userId);

      expect(result).toBe(deletedAvatarMessage);
      expect(service.deleteAvatar).toBeCalledWith(userId);
    });

    it('should throw error when avatar deletion fails', async () => {
      const userId = 1;

      jest
        .spyOn(service, 'deleteAvatar')
        .mockRejectedValue(new Error('Failed to delete avatar'));

      await expect(controller.deleteAvatar(userId)).rejects.toThrow(
        'Failed to delete avatar',
      );
    });
  });
});
