import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
export class RegisterUserDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsPhoneNumber(null) phone!: string;
}
