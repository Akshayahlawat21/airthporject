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
var JobWorkerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobWorkerService = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("../jobs.service");
const job_status_enum_1 = require("../../common/enums/job-status.enum");
let JobWorkerService = JobWorkerService_1 = class JobWorkerService {
    constructor(jobsService) {
        this.jobsService = jobsService;
        this.logger = new common_1.Logger(JobWorkerService_1.name);
    }
    async simulateJobExecution(jobId, durationMs = 4000) {
        this.logger.log(`[Worker] Started background processing for Job ${jobId}`);
        setTimeout(async () => {
            try {
                const job = await this.jobsService.findOne(jobId);
                if (!job) {
                    this.logger.warn(`[Worker] Job ${jobId} not found, aborting background task.`);
                    return;
                }
                if (job.status === job_status_enum_1.JobStatus.PENDING) {
                    await this.jobsService.updateStatus(jobId, { status: job_status_enum_1.JobStatus.RUNNING });
                    this.logger.log(`[Worker] Job ${jobId} transitioned to RUNNING`);
                }
                await new Promise((resolve) => setTimeout(resolve, durationMs));
                const isSuccess = Math.random() > 0.15;
                if (isSuccess) {
                    await this.jobsService.updateStatus(jobId, {
                        status: job_status_enum_1.JobStatus.COMPLETED,
                    });
                    this.logger.log(`[Worker] Job ${jobId} successfully COMPLETED`);
                }
                else {
                    await this.jobsService.updateStatus(jobId, {
                        status: job_status_enum_1.JobStatus.FAILED,
                        errorMessage: 'Simulated worker failure: upstream service timeout (504)',
                    });
                    this.logger.warn(`[Worker] Job ${jobId} simulated FAILED`);
                }
            }
            catch (err) {
                this.logger.error(`[Worker] Error processing job ${jobId}: ${err.message}`);
            }
        }, 100);
    }
};
exports.JobWorkerService = JobWorkerService;
exports.JobWorkerService = JobWorkerService = JobWorkerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => jobs_service_1.JobsService))),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobWorkerService);
//# sourceMappingURL=job-worker.service.js.map