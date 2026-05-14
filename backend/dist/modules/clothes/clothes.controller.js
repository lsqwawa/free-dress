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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClothesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clothes_service_1 = require("./clothes.service");
const create_cloth_dto_1 = require("./dto/create-cloth.dto");
const update_cloth_dto_1 = require("./dto/update-cloth.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let ClothesController = class ClothesController {
    constructor(clothesService) {
        this.clothesService = clothesService;
    }
    async create(userId, createClothDto) {
        return this.clothesService.create(userId, createClothDto);
    }
    async findAll(userId, category) {
        return this.clothesService.findAll(userId, category);
    }
    async findOne(id, userId) {
        return this.clothesService.findOne(id, userId);
    }
    async update(id, userId, updateClothDto) {
        return this.clothesService.update(id, userId, updateClothDto);
    }
    async remove(id, userId) {
        return this.clothesService.remove(id, userId);
    }
    async getCategoryStats(userId) {
        return this.clothesService.getCategoryStats(userId);
    }
};
exports.ClothesController = ClothesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建衣物', description: '上传一件新衣物到衣橱' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_cloth_dto_1.CreateClothDto]),
    __metadata("design:returntype", Promise)
], ClothesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取衣物列表', description: '获取当前用户的所有衣物' }),
    (0, swagger_1.ApiQuery)({ name: 'category', enum: client_1.ClothCategory, required: false, description: '按分类筛选' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClothesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取衣物详情', description: '获取指定衣物的详细信息' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClothesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新衣物', description: '更新指定衣物的信息' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_cloth_dto_1.UpdateClothDto]),
    __metadata("design:returntype", Promise)
], ClothesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除衣物', description: '删除指定的衣物' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClothesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/categories'),
    (0, swagger_1.ApiOperation)({ summary: '获取分类统计', description: '获取各分类的衣物数量统计' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClothesController.prototype, "getCategoryStats", null);
exports.ClothesController = ClothesController = __decorate([
    (0, swagger_1.ApiTags)('衣物'),
    (0, common_1.Controller)('clothes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [clothes_service_1.ClothesService])
], ClothesController);
//# sourceMappingURL=clothes.controller.js.map