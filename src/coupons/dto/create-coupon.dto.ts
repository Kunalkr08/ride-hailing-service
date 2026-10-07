import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
export class CreateCouponDto {
  @IsString() code!: string;
  @IsNumber() @Min(0.01) @Max(100) percentage!: number;
  @IsOptional() @IsNumber() @Min(0) maxDiscount?: number;
}
