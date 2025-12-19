import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateReviewDto } from '../../../src/events/dto/create-review.dto';

describe('CreateReviewDto', () => {
  it('validates successfully with all fields', async () => {
    const dto = plainToInstance(CreateReviewDto, {
      userId: 'user1',
      organizationId: 'org1',
      collaboratorsId: ['c1', 'c2'],
      rating: 5,
      title: 'Great event',
      comment: 'Had a wonderful time',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('validates when optional fields are omitted', async () => {
    const dto = plainToInstance(CreateReviewDto, {
      userId: 'user1',
      organizationId: 'org1',
      rating: 3,
      title: 'OK',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails when required fields are missing', async () => {
    const dto = plainToInstance(CreateReviewDto, {
      organizationId: 'org1',
      rating: 4,
      title: 'Title',
    });
    const errors = await validate(dto as any);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'userId')).toBe(true);
  });

  it('fails when rating is out of range or not integer', async () => {
    const dtoHigh = plainToInstance(CreateReviewDto, {
      userId: 'u',
      organizationId: 'o',
      rating: 6,
      title: 't',
    });
    const dtoFloat = plainToInstance(CreateReviewDto, {
      userId: 'u',
      organizationId: 'o',
      rating: 3.5,
      title: 't',
    });

    const errorsHigh = await validate(dtoHigh as any);
    const errorsFloat = await validate(dtoFloat as any);
    expect(errorsHigh.length).toBeGreaterThan(0);
    expect(errorsFloat.length).toBeGreaterThan(0);
  });

  it('fails when collaboratorsId is not array of strings', async () => {
    const dtoNotArray = plainToInstance(CreateReviewDto, {
      userId: 'u',
      organizationId: 'o',
      collaboratorsId: 'not-array',
      rating: 4,
      title: 't',
    });

    const dtoNonString = plainToInstance(CreateReviewDto, {
      userId: 'u',
      organizationId: 'o',
      collaboratorsId: [1, 2],
      rating: 4,
      title: 't',
    });

    const errorsNotArray = await validate(dtoNotArray as any);
    const errorsNonString = await validate(dtoNonString as any);
    expect(errorsNotArray.length).toBeGreaterThan(0);
    expect(errorsNonString.length).toBeGreaterThan(0);
  });
});
