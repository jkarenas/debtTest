import { IsOptional, IsNumber, IsString, IsPositive, MaxLength } from 'class-validator';

export class UpdateDebtDto {
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsPositive({ message: 'Amount must be positive' })
  amount?: number;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
}