import { UserSchema } from '../../../src/metadata/schemas/user.schema';

describe('UserSchema', () => {
  it('defines userId as required and unique', () => {
    const userPath: any = UserSchema.path('userId');
    expect(userPath).toBeDefined();
    expect(userPath.options.required).toBe(true);
    expect(userPath.options.unique).toBe(true);
  });

  it('has a unique index on userId', () => {
    const indexes = UserSchema.indexes();
    const uniqueIdx = indexes.find(
      ([keys, options]) =>
        keys.userId === 1 && options && options.unique === true,
    );
    expect(uniqueIdx).toBeDefined();
  });
});
