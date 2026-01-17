import { IsNumber, IsString, Min, Length, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import currencyCodes from 'currency-codes';

@ValidatorConstraint({ name: 'isCurrencyCode', async: false })
export class IsCurrencyCodeConstraint implements ValidatorConstraintInterface {
  validate(code: string) {
    return !!currencyCodes.code(code);
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.value} is not a valid ISO 4217 currency code`;
  }
}

export class MoneyDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @Length(3, 3, { message: 'Currency must be a valid 3-letter code' })
  @Validate(IsCurrencyCodeConstraint)
  currency: string = 'EUR';
}
