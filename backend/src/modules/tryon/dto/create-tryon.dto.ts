import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTryonDto {
  @ApiProperty({ description: '人物照片 URL', example: 'https://example.com/person.jpg' })
  @IsString()
  @IsNotEmpty()
  personImageUrl: string;

  @ApiProperty({ description: '搭配 ID', example: 'outfit-uuid' })
  @IsString()
  @IsNotEmpty()
  outfitId: string;
}
