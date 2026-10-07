import { IsEnum, IsNotEmpty, IsNumber, IsPhoneNumber, IsString, Max, Min } from 'class-validator';
import { CarType } from '../../common/types';
export class RegisterDriverDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsPhoneNumber('IN') phone!: string;
  @IsEnum(['SEDAN', 'HATCHBACK']) carType!: CarType;
  @IsNumber() @Min(-90) @Max(90) lat!: number;
  @IsNumber() @Min(-180) @Max(180) lng!: number;
}
