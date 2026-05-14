"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClothDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateClothDto {
}
exports.CreateClothDto = CreateClothDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '衣物图片URL', example: 'https://example.com/cloth.jpg' }),
    (0, class_validator_1.IsString)({ message: '图片URL必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '图片URL不能为空' }),
    __metadata("design:type", String)
], CreateClothDto.prototype, "imageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '衣物分类',
        enum: client_1.ClothCategory,
        example: 'TOP'
    }),
    (0, class_validator_1.IsEnum)(client_1.ClothCategory, { message: '无效的衣物分类' }),
    (0, class_validator_1.IsNotEmpty)({ message: '分类不能为空' }),
    __metadata("design:type", String)
], CreateClothDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '颜色', example: '黑色', required: false }),
    (0, class_validator_1.IsString)({ message: '颜色必须是字符串' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClothDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '风格', example: '休闲', required: false }),
    (0, class_validator_1.IsString)({ message: '风格必须是字符串' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClothDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '适用季节', example: ['春', '夏'], required: false, type: [String] }),
    (0, class_validator_1.IsArray)({ message: '季节必须是数组' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClothDto.prototype, "season", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签', example: ['T恤', '纯棉'], required: false, type: [String] }),
    (0, class_validator_1.IsArray)({ message: '标签必须是数组' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateClothDto.prototype, "tags", void 0);
//# sourceMappingURL=create-cloth.dto.js.map