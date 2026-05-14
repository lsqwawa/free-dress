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
exports.ClothesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClothesService = class ClothesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createClothDto) {
        const cloth = await this.prisma.cloth.create({
            data: {
                ...createClothDto,
                userId,
            },
        });
        return cloth;
    }
    async findAll(userId, category) {
        const where = { userId };
        if (category) {
            where.category = category;
        }
        const clothes = await this.prisma.cloth.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return clothes;
    }
    async findOne(id, userId) {
        const cloth = await this.prisma.cloth.findUnique({
            where: { id },
            include: {
                outfitClothes: {
                    include: {
                        outfit: true,
                    },
                },
            },
        });
        if (!cloth) {
            throw new common_1.NotFoundException('衣物不存在');
        }
        if (cloth.userId !== userId) {
            throw new common_1.ForbiddenException('无权访问该衣物');
        }
        return cloth;
    }
    async update(id, userId, updateClothDto) {
        const existingCloth = await this.findOne(id, userId);
        const cloth = await this.prisma.cloth.update({
            where: { id },
            data: updateClothDto,
        });
        return cloth;
    }
    async remove(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.cloth.delete({
            where: { id },
        });
        return { message: '删除成功' };
    }
    async getCategoryStats(userId) {
        const stats = await this.prisma.cloth.groupBy({
            by: ['category'],
            where: { userId },
            _count: {
                category: true,
            },
        });
        const result = {
            TOP: 0,
            BOTTOM: 0,
            COAT: 0,
            ACCESSORY: 0,
            SHOE: 0,
        };
        stats.forEach((stat) => {
            result[stat.category] = stat._count.category;
        });
        return result;
    }
};
exports.ClothesService = ClothesService;
exports.ClothesService = ClothesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClothesService);
//# sourceMappingURL=clothes.service.js.map