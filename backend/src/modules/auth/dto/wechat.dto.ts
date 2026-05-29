import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 微信小程序登录 DTO
 */
export class WechatMpLoginDto {
  @ApiProperty({ description: '小程序 wx.login 返回的 code' })
  @IsString({ message: 'code 必须是字符串' })
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;

  @ApiProperty({ description: '微信昵称（可选）', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '微信头像 URL（可选）', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

/**
 * 微信 App 登录 DTO
 */
export class WechatAppLoginDto {
  @ApiProperty({ description: '微信 OpenSDK 授权回调的 code' })
  @IsString({ message: 'code 必须是字符串' })
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;
}

/**
 * 已登录账号绑定微信 DTO（小程序）
 */
export class BindWechatMpDto {
  @ApiProperty({ description: '小程序 wx.login 返回的 code' })
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;
}

/**
 * 已登录账号绑定微信 DTO（App）
 */
export class BindWechatAppDto {
  @ApiProperty({ description: '微信 OpenSDK 授权回调的 code' })
  @IsString()
  @IsNotEmpty({ message: 'code 不能为空' })
  code: string;
}

/**
 * 已登录账号绑定手机号 DTO
 */
export class BindPhoneDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({ description: '图片验证码 ID' })
  @IsString()
  @IsNotEmpty({ message: '验证码 ID 不能为空' })
  captchaId: string;

  @ApiProperty({ description: '图片验证码答案' })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  captchaAnswer: string;
}
