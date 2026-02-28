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
exports.ConcertsController = void 0;
const common_1 = require("@nestjs/common");
const concerts_service_1 = require("./concerts.service");
const create_concert_dto_1 = require("./dto/create-concert.dto");
const update_concert_dto_1 = require("./dto/update-concert.dto");
let ConcertsController = class ConcertsController {
    concertsService;
    constructor(concertsService) {
        this.concertsService = concertsService;
    }
    create(createConcertDto) {
        return this.concertsService.create(createConcertDto);
    }
    findAll() {
        return this.concertsService.findAll();
    }
    findOne(id) {
        return this.concertsService.findOne(+id);
    }
    update(id, updateConcertDto) {
        return this.concertsService.update(+id, updateConcertDto);
    }
    remove(id) {
        return this.concertsService.remove(+id);
    }
};
exports.ConcertsController = ConcertsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_concert_dto_1.CreateConcertDto]),
    __metadata("design:returntype", void 0)
], ConcertsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConcertsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConcertsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_concert_dto_1.UpdateConcertDto]),
    __metadata("design:returntype", void 0)
], ConcertsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConcertsController.prototype, "remove", null);
exports.ConcertsController = ConcertsController = __decorate([
    (0, common_1.Controller)('concerts'),
    __metadata("design:paramtypes", [concerts_service_1.ConcertsService])
], ConcertsController);
//# sourceMappingURL=concerts.controller.js.map