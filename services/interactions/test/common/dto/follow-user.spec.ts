import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FollowUserDto } from '../../../src/users/common/dto/follow-user.dto';

describe('FollowUserDto', () => {
  it('valid when followedId is a non-empty string', async () => {
    const dto = plainToInstance(FollowUserDto, { followedId: 'user-123' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('invalid when followedId is empty', async () => {
    const dto = plainToInstance(FollowUserDto, { followedId: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('followedId');
  });

  it('invalid when followedId is missing', async () => {
    const dto = plainToInstance(FollowUserDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
