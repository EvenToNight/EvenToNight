import { LikeSchema } from '../../../src/events/schemas/like.schema';

describe('LikeSchema', () => {
  it('defines eventId and userId as required and indexed', () => {
    const eventPath = LikeSchema.path('eventId') as {
      options?: { required?: boolean; index?: boolean };
    };
    const userPath = LikeSchema.path('userId') as {
      options?: { required?: boolean; index?: boolean };
    };

    expect(eventPath).toBeDefined();
    expect(userPath).toBeDefined();

    expect(eventPath.options!.required).toBe(true);
    expect(userPath.options!.required).toBe(true);

    expect(eventPath.options!.index).toBe(true);
    expect(userPath.options!.index).toBe(true);
  });

  it('defines a unique compound index on eventId and userId', () => {
    const indexes = LikeSchema.indexes() as Array<
      [Record<string, number>, Record<string, unknown> | undefined]
    >;
    const compound = indexes.find(
      ([keys, options]) =>
        keys.eventId === 1 &&
        keys.userId === 1 &&
        options &&
        options.unique === true,
    );

    expect(compound).toBeDefined();
  });
});
