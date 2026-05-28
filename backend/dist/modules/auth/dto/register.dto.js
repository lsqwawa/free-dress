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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138000' }),
    (0, class_validator_1.IsString)({ message: '手机号必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '手机号不能为空' }),
    (0, class_validator_1.Matches)(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '密码', example: '123456' }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '密码不能为空' }),
    (0, class_validator_1.Length)(6, 20, { message: '密码长度必须在6-20位之间' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '验证码ID', example: 'uuid-captcha-id' }),
    (0, class_validator_1.IsString)({ message: '验证码ID必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '验证码ID不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "captchaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '验证码答案', example: 'A3X7' }),
    (0, class_validator_1.IsString)({ message: '验证码答案必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '验证码不能为空' }),
    (0, class_validator_1.Length)(4, 4, { message: '验证码必须为4位' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "captchaAnswer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '昵称', example: '小明' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '昵称必须是字符串' }),
    (0, class_validator_1.Length)(1, 20, { message: '昵称长度必须在1-20位之间' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "nickname", void 0);
//# sourceMappingURL=register.dto.js.map