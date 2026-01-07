import { IsString, IsEmail, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProvaDto {
  @IsString()
  nome: string;

  @IsString()
  cognome: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  eta?: number;
}
