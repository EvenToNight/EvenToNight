import { EventSchema } from '../../../src/metadata/schemas/event.schema';

describe('EventSchema', () => {
  it('defines eventId as required and unique', () => {
    const eventPath = EventSchema.path('eventId') as {
      options?: { required?: boolean; unique?: boolean };
    };
    expect(eventPath).toBeDefined();
    expect(eventPath.options?.required).toBe(true);
    expect(eventPath.options?.unique).toBe(true);
  });

  it('defines organizationId as required and indexed', () => {
    const orgPath = EventSchema.path('organizationId') as {
      options?: { required?: boolean; index?: boolean };
    };
    expect(orgPath).toBeDefined();
    expect(orgPath.options?.required).toBe(true);
    expect(orgPath.options?.index).toBe(true);
  });

  it('defines collaboratorIds as array of strings with default empty array', () => {
    const collabPath = EventSchema.path('collaboratorIds') as {
      instance?: string;
      caster?: { instance?: string };
      options?: { default?: unknown };
    };
    expect(collabPath).toBeDefined();
    expect(collabPath.instance).toBe('Array');
    expect(collabPath.caster?.instance).toBe('String');
    expect(collabPath.options?.default).toEqual([]);
  });

  it('has a unique index on eventId', () => {
    const indexes = EventSchema.indexes() as Array<
      [Record<string, number>, Record<string, unknown> | undefined]
    >;
    const uniqueIdx = indexes.find(
      ([keys, options]) =>
        keys.eventId === 1 && options && options.unique === true,
    );
    expect(uniqueIdx).toBeDefined();
  });
});
