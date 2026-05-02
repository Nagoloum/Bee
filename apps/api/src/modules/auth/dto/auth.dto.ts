import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+237670000000', required: false })
  @IsOptional()
  @Matches(/^\+\d{10,15}$/, { message: 'Phone must be in E.164 format' })
  phone?: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiProperty({ enum: [UserRole.CLIENT, UserRole.VENDOR, UserRole.DELIVERY] })
  @IsEnum([UserRole.CLIENT, UserRole.VENDOR, UserRole.DELIVERY], {
    message: 'Only CLIENT, VENDOR or DELIVERY can register',
  })
  role!: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referralCode?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class TwoFactorVerifyDto {
  @ApiProperty({ description: 'JWT temporaire reçu du /auth/login' })
  @IsString()
  tempToken!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class TwoFactorEnableDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
