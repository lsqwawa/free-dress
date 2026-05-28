import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 重置密码请求 DTO
 */
export class ResetPasswordDto {
  @ApiProperty({ description: '重置令牌', example: 'reset-token-uuid' })
  @IsString({ message: '重置令牌必须是字符串' })
  @IsNotEmpty({ message: '重置令牌不能为空' })
  resetToken: string;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @Length(6, 20, { message: '密码长度必须在6-20位之间' })
  newPassword: string;
}
