import { validate } from 'class-validator';
import { ReviewStatsDto } from '../../../src/events/dto/review-stats.dto';

describe('ReviewStatsDto validation', () => {
  it('valid sample passes validation', async () => {
    const dto = new ReviewStatsDto();
    dto.averageRating = 4.2;
    dto.ratingDistribution = { '5': 10, '4': 2, '3': 0 } as any;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('negative averageRating fails validation', async () => {
    const dto = new ReviewStatsDto();
    dto.averageRating = -1 as any;
    dto.ratingDistribution = { '5': 1 } as any;

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'averageRating')).toBeTruthy();
  });

  it('averageRating greater than 5 fails validation', async () => {
    const dto = new ReviewStatsDto();
    dto.averageRating = 6 as any;
    dto.ratingDistribution = { '5': 1 } as any;

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'averageRating')).toBeTruthy();
  });

  it('null ratingDistribution fails validation', async () => {
    const dto = new ReviewStatsDto();
    dto.averageRating = 4 as any;
    // @ts-expect-error testing runtime validation
    dto.ratingDistribution = null;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'ratingDistribution'),
    ).toBeTruthy();
  });

  it('ratingDistribution with negative value fails validation', async () => {
    const dto = new ReviewStatsDto();
    dto.averageRating = 4 as any;
    dto.ratingDistribution = { '5': -2 } as any;

    const errors = await validate(dto);
    expect(
      errors.some((e) => e.property === 'ratingDistribution'),
    ).toBeTruthy();
  });
});
