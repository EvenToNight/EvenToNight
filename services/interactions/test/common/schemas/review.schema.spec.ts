import { ReviewSchema } from '../../../src/events/schemas/review.schema';

describe('ReviewSchema', () => {
  it('defines eventId, userId and organizationId as required and indexed', () => {
    const eventPath: any = ReviewSchema.path('eventId');
    const userPath: any = ReviewSchema.path('userId');
    const orgPath: any = ReviewSchema.path('organizationId');

    expect(eventPath).toBeDefined();
    expect(userPath).toBeDefined();
    expect(orgPath).toBeDefined();

    expect(eventPath.options.required).toBe(true);
    expect(userPath.options.required).toBe(true);
    expect(orgPath.options.required).toBe(true);

    expect(eventPath.options.index).toBe(true);
    expect(userPath.options.index).toBe(true);
    expect(orgPath.options.index).toBe(true);
  });

  it('defines collaboratorsId as array of strings and indexed', () => {
    const collabPath: any = ReviewSchema.path('collaboratorsId');
    expect(collabPath).toBeDefined();
    expect(collabPath.instance).toBe('Array');
    expect(collabPath.caster.instance).toBe('String');
    expect(collabPath.options.index).toBe(true);
  });

  it('defines rating with min and max and required', () => {
    const ratingPath: any = ReviewSchema.path('rating');
    expect(ratingPath).toBeDefined();
    expect(ratingPath.options.required).toBe(true);
    expect(ratingPath.options.min).toBe(1);
    expect(ratingPath.options.max).toBe(5);
  });

  it('defines title required and comment optional', () => {
    const titlePath: any = ReviewSchema.path('title');
    const commentPath: any = ReviewSchema.path('comment');
    expect(titlePath).toBeDefined();
    expect(titlePath.options.required).toBe(true);
    expect(commentPath).toBeDefined();
    expect(commentPath.options.required).toBeFalsy();
  });

  it('defines unique compound index on eventId and userId', () => {
    const indexes = ReviewSchema.indexes();
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
