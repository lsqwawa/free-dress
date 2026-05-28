import { IsString, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 用户注册请求 DTO
 * 使用图片验证码进行人机验证
 */
export class RegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString({ message: '手机号必须是字符串' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 20, { message: '密码长度必须在6-20位之间' })
  password: string;

  @ApiProperty({ description: '验证码ID', example: 'uuid-captcha-id' })
  @IsString({ message: '验证码ID必须是字符串' })
  @IsNotEmpty({ message: '验证码ID不能为空' })
  captchaId: string;

  @ApiProperty({ description: '验证码答案', example: 'A3X7' })
  @IsString({ message: '验证码答案必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(4, 4, { message: '验证码必须为4位' })
  captchaAnswer: string;

  @ApiPropertyOptional({ description: '昵称', example: '小明' })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @Length(1, 20, { message: '昵称长度必须在1-20位之间' })
  nickname?: string;
}
