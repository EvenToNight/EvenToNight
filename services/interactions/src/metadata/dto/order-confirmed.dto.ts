import { IsString, IsNotEmpty } from 'class-validator';

export class OrderConfirmedDto {  
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;
}