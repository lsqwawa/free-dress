import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新用户资料请求 DTO
 */
export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', example: '小明', required: false })
  @IsString({ message: '昵称必须是字符串' })
  @IsOptional()
  @Length(1, 20, { message: '昵称长度必须在1-20位之间' })
  nickname?: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsString({ message: '头像URL必须是字符串' })
  @IsOptional()
  avatarUrl?: string;
}
