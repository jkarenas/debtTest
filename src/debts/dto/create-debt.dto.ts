import { IsNotEmpty, IsNumber, IsString, IsPositive, MaxLength } from 'class-validator';

export class CreateDebtDto {
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsPositive({ message: 'Amount must be positive' })
  amount: number;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description: string;
}