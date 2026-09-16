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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("./entities/job.entity");
const job_status_enum_1 = require("../common/enums/job-status.enum");
const job_state_machine_1 = require("./state-machine/job-state-machine");
let JobsService = JobsService_1 = class JobsService {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
        this.logger = new common_1.Logger(JobsService_1.name);
    }
    async create(createJobDto) {
        const job = this.jobRepository.create({
            title: createJobDto.title.trim(),
            type: createJobDto.type.trim(),
            status: job_status_enum_1.JobStatus.PENDING,
            version: 1,
        });
        const savedJob = await this.jobRepository.save(job);
        this.logger.log(`Created new job: [${savedJob.id}] "${savedJob.title}" (${savedJob.type})`);
        if (createJobDto.autoSimulate) {
            this.triggerSimulation(savedJob.id);
        }
        return savedJob;
    }
    async findAll(query) {
        const queryBuilder = this.jobRepository.createQueryBuilder('job');
        if (query?.status) {
            queryBuilder.andWhere('job.status = :status', { status: query.status });
        }
        if (query?.search && query.search.trim()) {
            const searchTerm = `%${query.search.trim()}%`;
            queryBuilder.andWhere('(LOWER(job.title) LIKE LOWER(:search) OR LOWER(job.type) LIKE LOWER(:search))', { search: searchTerm });
        }
        queryBuilder.orderBy('job.createdAt', 'DESC');
        return await queryBuilder.getMany();
    }
    async findOne(id) {
        const job = await this.jobRepository.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID '${id}' was not found.`);
        }
        return job;
    }
    async getStats() {
        const rawCounts = await this.jobRepository
            .createQueryBuilder('job')
            .select('job.status', 'status')
            .addSelect('COUNT(job.id)', 'count')
            .groupBy('job.status')
            .getRawMany();
        const stats = {
            total: 0,
            pending: 0,
            running: 0,
            completed: 0,
            failed: 0,
        };
        for (const row of rawCounts) {
            const count = parseInt(row.count, 10) || 0;
            if (row.status in stats) {
                stats[row.status] = count;
            }
            stats.total += count;
        }
        return stats;
    }
    async updateStatus(id, updateJobStatusDto) {
        const currentJob = await this.findOne(id);
        job_state_machine_1.JobStateMachine.validateTransition(currentJob.status, updateJobStatusDto.status);
        const updatePayload = {
            status: updateJobStatusDto.status,
            updatedAt: new Date(),
        };
        if (updateJobStatusDto.status === job_status_enum_1.JobStatus.FAILED) {
            updatePayload.errorMessage =
                updateJobStatusDto.errorMessage || 'Job failed during execution.';
        }
        else if (updateJobStatusDto.status === job_status_enum_1.JobStatus.COMPLETED) {
            updatePayload.errorMessage = undefined;
        }
        const updateResult = await this.jobRepository
            .createQueryBuilder()
            .update(job_entity_1.Job)
            .set({
            ...updatePayload,
            version: () => 'version + 1',
        })
            .where('id = :id AND status = :expectedStatus AND version = :expectedVersion', {
            id,
            expectedStatus: currentJob.status,
            expectedVersion: currentJob.version,
        })
            .execute();
        if (updateResult.affected === 0) {
            const refreshedJob = await this.jobRepository.findOne({ where: { id } });
            if (!refreshedJob) {
                throw new common_1.NotFoundException(`Job with ID '${id}' was deleted by another process.`);
            }
            this.logger.warn(`[Concurrency Conflict] Transition rejected for job ${id}. Attempted transition from '${currentJob.status}' (v${currentJob.version}) to '${updateJobStatusDto.status}', but current state is '${refreshedJob.status}' (v${refreshedJob.version}).`);
            throw new common_1.ConflictException(`Concurrency Conflict: Job '${id}' has already been transitioned to '${refreshedJob.status}' (version ${refreshedJob.version}) by a concurrent request. Action aborted to preserve state consistency.`);
        }
        this.logger.log(`Job [${id}] transitioned: '${currentJob.status}' -> '${updateJobStatusDto.status}' (version ${currentJob.version + 1})`);
        return await this.findOne(id);
    }
    async remove(id) {
        const job = await this.findOne(id);
        await this.jobRepository.remove(job);
        this.logger.log(`Deleted job: [${id}] "${job.title}"`);
        return {
            success: true,
            message: `Job '${id}' (${job.title}) successfully deleted.`,
        };
    }
    triggerSimulation(id) {
        setTimeout(async () => {
            try {
                const job = await this.jobRepository.findOne({ where: { id } });
                if (!job || job.status !== job_status_enum_1.JobStatus.PENDING)
                    return;
                await this.updateStatus(id, { status: job_status_enum_1.JobStatus.RUNNING });
                setTimeout(async () => {
                    try {
                        const runningJob = await this.jobRepository.findOne({ where: { id } });
                        if (!runningJob || runningJob.status !== job_status_enum_1.JobStatus.RUNNING)
                            return;
                        const shouldFail = Math.random() < 0.1;
                        if (shouldFail) {
                            await this.updateStatus(id, {
                                status: job_status_enum_1.JobStatus.FAILED,
                                errorMessage: 'Simulated worker encountered an unhandled pipeline error',
                            });
                        }
                        else {
                            await this.updateStatus(id, { status: job_status_enum_1.JobStatus.COMPLETED });
                        }
                    }
                    catch (err) {
                        this.logger.warn(`Simulation completion error for job ${id}: ${err.message}`);
                    }
                }, 3000);
            }
            catch (err) {
                this.logger.warn(`Simulation start error for job ${id}: ${err.message}`);
            }
        }, 1000);
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], JobsService);
//# sourceMappingURL=jobs.service.js.map