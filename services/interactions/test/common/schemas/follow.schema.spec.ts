import { FollowSchema } from '../../../src/users/common/schemas/follow.schema';

describe('FollowSchema', () => {
  it('defines followerId and followedId as required and indexed', () => {
    const followerPath: any = FollowSchema.path('followerId');
    const followedPath: any = FollowSchema.path('followedId');

    expect(followerPath).toBeDefined();
    expect(followedPath).toBeDefined();

    expect(followerPath.options.required).toBe(true);
    expect(followedPath.options.required).toBe(true);

    expect(followerPath.options.index).toBe(true);
    expect(followedPath.options.index).toBe(true);
  });

  it('defines a unique compound index on followerId and followedId', () => {
    const indexes = FollowSchema.indexes();
    const compound = indexes.find(
      ([keys, options]) =>
        keys.followerId === 1 &&
        keys.followedId === 1 &&
        options &&
        options.unique === true,
    );

    expect(compound).toBeDefined();
  });
});
