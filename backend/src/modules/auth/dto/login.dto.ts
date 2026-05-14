import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户登录请求 DTO
 */
export class LoginDto {
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
}
