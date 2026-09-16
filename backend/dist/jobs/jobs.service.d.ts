import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobQueryDto } from './dto/job-query.dto';
export interface JobStatsResponse {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
}
export declare class JobsService {
    private readonly jobRepository;
    private readonly logger;
    constructor(jobRepository: Repository<Job>);
    create(createJobDto: CreateJobDto): Promise<Job>;
    findAll(query?: JobQueryDto): Promise<Job[]>;
    findOne(id: string): Promise<Job>;
    getStats(): Promise<JobStatsResponse>;
    updateStatus(id: string, updateJobStatusDto: UpdateJobStatusDto): Promise<Job>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    triggerSimulation(id: string): void;
}
