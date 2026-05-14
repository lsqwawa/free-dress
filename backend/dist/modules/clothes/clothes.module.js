"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClothesModule = void 0;
const common_1 = require("@nestjs/common");
const clothes_service_1 = require("./clothes.service");
const clothes_controller_1 = require("./clothes.controller");
let ClothesModule = class ClothesModule {
};
exports.ClothesModule = ClothesModule;
exports.ClothesModule = ClothesModule = __decorate([
    (0, common_1.Module)({
        controllers: [clothes_controller_1.ClothesController],
        providers: [clothes_service_1.ClothesService],
        exports: [clothes_service_1.ClothesService],
    })
], ClothesModule);
//# sourceMappingURL=clothes.module.js.map