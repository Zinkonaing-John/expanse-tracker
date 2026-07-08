import { IsNumber, IsString, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';

export enum InputMethod {
  VOICE = 'voice',
  CAMERA = 'camera',
  MANUAL = 'manual',
}

export class CreateExpenseDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  receiptUri?: string;

  @IsEnum(InputMethod)
  inputMethod: InputMethod;
}
