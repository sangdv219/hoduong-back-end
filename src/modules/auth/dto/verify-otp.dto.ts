import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'email', example: 'songido3@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
  @ApiProperty({ description: 'otp', example: '111111' })
  @IsNotEmpty({ message: 'OTP is required' })
  @MinLength(6, { message: 'OTP must be at least 6 characters long' })
  otp: string;
}
