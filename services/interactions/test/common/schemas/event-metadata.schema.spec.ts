import { EventSchema } from '../../../src/metadata/schemas/event.schema';

describe('EventSchema', () => {
  it('defines eventId as required and unique', () => {
    const eventPath: any = EventSchema.path('eventId');
    expect(eventPath).toBeDefined();
    expect(eventPath.options.required).toBe(true);
    expect(eventPath.options.unique).toBe(true);
  });

  it('defines organizationId as required and indexed', () => {
    const orgPath: any = EventSchema.path('organizationId');
    expect(orgPath).toBeDefined();
    expect(orgPath.options.required).toBe(true);
    expect(orgPath.options.index).toBe(true);
  });

  it('defines collaboratorsId as array of strings with default empty array', () => {
    const collabPath: any = EventSchema.path('collaboratorsId');
    expect(collabPath).toBeDefined();
    expect(collabPath.instance).toBe('Array');
    expect(collabPath.caster.instance).toBe('String');
    expect(collabPath.options.default).toEqual([]);
  });

  it('has a unique index on eventId', () => {
    const indexes = EventSchema.indexes();
    const uniqueIdx = indexes.find(
      ([keys, options]) =>
        keys.eventId === 1 && options && options.unique === true,
    );
    expect(uniqueIdx).toBeDefined();
  });
});
