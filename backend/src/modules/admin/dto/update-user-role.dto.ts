import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * 修改用户角色 DTO
 */
export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'role 必须是 USER / VIP / ADMIN 之一' })
  role!: UserRole;
}
