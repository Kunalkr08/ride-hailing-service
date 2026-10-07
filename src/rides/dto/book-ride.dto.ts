import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CarType } from '../../common/types';
export class BookRideDto {
  @IsString() userId!: string;
  @IsEnum(['SEDAN', 'HATCHBACK']) carType!: CarType;
  @IsNumber() @Min(-90) @Max(90) pickupLat!: number;
  @IsNumber() @Min(-180) @Max(180) pickupLng!: number;
  @IsOptional() @IsString() couponCode?: string;
}
