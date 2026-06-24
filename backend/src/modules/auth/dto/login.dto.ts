import { IsString, IsNotEmpty, Length, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户登录请求 DTO
 */
export class LoginDto {
  /**
   * 登录账号字段。
   * 注意：此字段同时支持普通用户的 11 位手机号，以及管理员账号名（如 "admin"）。
   * 因此放宽校验：允许 11 位手机号格式，或 2-20 位由字母/数字/下划线组成的管理员账号名。
   * RegisterDto 仍然保持严格的 11 位手机号校验，不受影响。
   */
  @ApiProperty({ description: '手机号或管理员账号名', example: '13800138000' })
  @IsString({ message: '账号必须是字符串' })
  @IsNotEmpty({ message: '账号不能为空' })
  @Matches(/^(1[3-9]\d{9}|[A-Za-z][A-Za-z0-9_]{1,19})$/, {
    message: '账号格式不正确（支持11位手机号或管理员账号名）',
  })
  phone: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 20, { message: '密码长度必须在6-20位之间' })
  password: string;

  /**
   * 可选：小程序登录时携带 wx.login 返回的 code，
   * 后端在登录成功后尝试自动绑定当前微信（如未冲突）
   * App 端 / Web 端不需要传，保持向后兼容
   */
  @ApiProperty({
    description: '可选：小程序 wx.login() 返回的 code（用于自动绑定微信）',
    required: false,
  })
  @IsString()
  @IsOptional()
  wechatCode?: string;
}
