import { ReviewSchema } from '../../../src/events/schemas/review.schema';

describe('ReviewSchema', () => {
  it('defines eventId, userId and organizationId as required and indexed', () => {
    const eventPath = ReviewSchema.path('eventId') as {
      options?: { required?: boolean; index?: boolean };
    };
    const userPath = ReviewSchema.path('userId') as {
      options?: { required?: boolean; index?: boolean };
    };
    const orgPath = ReviewSchema.path('organizationId') as {
      options?: { required?: boolean; index?: boolean };
    };

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
    const collabPath = ReviewSchema.path('collaboratorsId') as {
      instance?: string;
      caster?: { instance?: string };
      options?: { index?: boolean };
    };
    expect(collabPath).toBeDefined();
    expect(collabPath.instance).toBe('Array');
    expect(collabPath.caster?.instance).toBe('String');
    expect(collabPath.options?.index).toBe(true);
  });

  it('defines rating with min and max and required', () => {
    const ratingPath = ReviewSchema.path('rating') as {
      options?: { required?: boolean; min?: number; max?: number };
    };
    expect(ratingPath).toBeDefined();
    expect(ratingPath.options?.required).toBe(true);
    expect(ratingPath.options?.min).toBe(1);
    expect(ratingPath.options?.max).toBe(5);
  });

  it('defines title required and comment optional', () => {
    const titlePath = ReviewSchema.path('title') as {
      options?: { required?: boolean };
    };
    const commentPath = ReviewSchema.path('comment') as {
      options?: { required?: boolean };
    };
    expect(titlePath).toBeDefined();
    expect(titlePath.options?.required).toBe(true);
    expect(commentPath).toBeDefined();
    expect(commentPath.options?.required).toBeFalsy();
  });

  it('defines unique compound index on eventId and userId', () => {
    const indexes = ReviewSchema.indexes() as Array<
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
