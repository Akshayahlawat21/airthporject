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
exports.UpdateJobStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const job_status_enum_1 = require("../../common/enums/job-status.enum");
class UpdateJobStatusDto {
}
exports.UpdateJobStatusDto = UpdateJobStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: job_status_enum_1.JobStatus,
        example: job_status_enum_1.JobStatus.RUNNING,
        description: 'Target status to transition the job into',
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Status is required' }),
    (0, class_validator_1.IsEnum)(job_status_enum_1.JobStatus, {
        message: `Status must be one of: ${Object.values(job_status_enum_1.JobStatus).join(', ')}`,
    }),
    __metadata("design:type", String)
], UpdateJobStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Process crashed due to out of memory',
        description: 'Optional error explanation when transitioning to failed status',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'errorMessage must be a string' }),
    __metadata("design:type", String)
], UpdateJobStatusDto.prototype, "errorMessage", void 0);
//# sourceMappingURL=update-job-status.dto.js.map