import {
  IsNumber,
  Min,
  Max,
  IsObject,
  IsNotEmpty,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isRatingDistribution', async: false })
class IsRatingDistributionConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    if (typeof value !== 'object' || value === null) return false;
    return Object.keys(value).every((k) => {
      if (!/^\d+$/.test(k)) return false;
      const v = value[k];
      return typeof v === 'number' && Number.isFinite(v) && v >= 0;
    });
  }

  defaultMessage(_args: ValidationArguments) {
    return 'ratingDistribution must be an object with numeric keys and non-negative numeric values';
  }
}

export class ReviewStatsDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  averageRating: number;

  @IsObject()
  @IsNotEmpty()
  @Validate(IsRatingDistributionConstraint)
  ratingDistribution: Record<number, number>;
}
