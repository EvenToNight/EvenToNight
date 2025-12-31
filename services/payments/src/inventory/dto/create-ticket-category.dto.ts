import { IsString, IsNumber, IsOptional, Min, IsBoolean, IsDateString } from 'class-validator';

export class CreateTicketCategoryDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number; // In cents

  @IsNumber()
  @Min(0)
  totalCapacity: number;

  @IsOptional()
  @IsDateString()
  saleStartDate?: string;

  @IsOptional()
  @IsDateString()
  saleEndDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetupInventoryDto {
  @IsString()
  eventId: string;

  categories: CreateTicketCategoryDto[];
}
