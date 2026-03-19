import 'reflect-metadata';
import { UsersService } from '../../src/users/services/users.service';
import { UserRole } from '../../src/users/schemas/user.schema';

describe('UsersService', () => {
  let userModel: {
    findOneAndUpdate: jest.Mock;
    deleteOne: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
  };
  let service: UsersService;

  beforeEach(() => {
    userModel = {
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    service = new UsersService(userModel as never);
  });

  it('upsertUser uses findOneAndUpdate with upsert options', async () => {
    const user = {
      id: 'u1',
      role: UserRole.MEMBER,
      name: 'Tom',
      avatar: 'a.jpg',
    };
    userModel.findOneAndUpdate.mockResolvedValue(user);

    const result = await service.upsertUser(user);

    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'u1' },
      user,
      { upsert: true, new: true },
    );
    expect(result).toEqual(user);
  });

  it('updateUser applies partial updates with $set', async () => {
    const updated = { id: 'u1', name: 'New Name' };
    userModel.findOneAndUpdate.mockResolvedValue(updated);

    const result = await service.updateUser('u1', { name: 'New Name' });

    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'u1' },
      { $set: { name: 'New Name' } },
      { new: true },
    );
    expect(result).toEqual(updated);
  });

  it('deleteUser calls deleteOne', async () => {
    userModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteUser('u1');

    expect(userModel.deleteOne).toHaveBeenCalledWith({ id: 'u1' });
  });

  it('userExists returns true when user is found', async () => {
    userModel.findOne.mockResolvedValue({ id: 'u1' });

    const result = await service.userExists('u1');

    expect(result).toBe(true);
  });

  it('userExists returns false when user is missing', async () => {
    userModel.findOne.mockResolvedValue(null);

    const result = await service.userExists('u1');

    expect(result).toBe(false);
  });

  it('getUserInfo returns user model result', async () => {
    userModel.findOne.mockResolvedValue({ id: 'u2' });

    const result = await service.getUserInfo('u2');

    expect(userModel.findOne).toHaveBeenCalledWith({ id: 'u2' });
    expect(result).toEqual({ id: 'u2' });
  });

  it('getUsername returns selected name or null', async () => {
    const exec = jest.fn().mockResolvedValue({ name: 'Alice' });
    const select = jest.fn().mockReturnValue({ exec });
    userModel.findOne.mockReturnValue({ select });

    const username = await service.getUsername('u1');

    expect(username).toBe('Alice');

    exec.mockResolvedValue(null);
    const noUser = await service.getUsername('u1');
    expect(noUser).toBeNull();
  });

  it('searchUsers delegates to find(query).exec()', async () => {
    const query = { role: UserRole.ORGANIZATION };
    const exec = jest.fn().mockResolvedValue([{ id: 'o1' }]);
    userModel.find.mockReturnValue({ exec });

    const result = await service.searchUsers(query);

    expect(userModel.find).toHaveBeenCalledWith(query);
    expect(result).toEqual([{ id: 'o1' }]);
  });
});
