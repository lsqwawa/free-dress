"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClothDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_cloth_dto_1 = require("./create-cloth.dto");
class UpdateClothDto extends (0, swagger_1.PartialType)(create_cloth_dto_1.CreateClothDto) {
}
exports.UpdateClothDto = UpdateClothDto;
//# sourceMappingURL=update-cloth.dto.js.map