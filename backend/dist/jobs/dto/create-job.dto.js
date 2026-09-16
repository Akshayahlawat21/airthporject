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
exports.CreateJobDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateJobDto {
}
exports.CreateJobDto = CreateJobDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Process Monthly Invoices',
        description: 'The title or task description for the job',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)({ message: 'Title must be a string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Title cannot exceed 255 characters' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'data-processing',
        description: 'The category or type of work this job performs',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Type is required' }),
    (0, class_validator_1.IsString)({ message: 'Type must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Type cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateJobDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: false,
        description: 'If true, automatically triggers simulated asynchronous background execution',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'autoSimulate must be a boolean' }),
    __metadata("design:type", Boolean)
], CreateJobDto.prototype, "autoSimulate", void 0);
//# sourceMappingURL=create-job.dto.js.map