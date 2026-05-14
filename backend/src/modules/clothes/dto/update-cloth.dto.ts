import { PartialType } from '@nestjs/swagger';
import { CreateClothDto } from './create-cloth.dto';

/**
 * 更新衣物请求 DTO
 * 继承 CreateClothDto，所有字段可选
 */
export class UpdateClothDto extends PartialType(CreateClothDto) {}
