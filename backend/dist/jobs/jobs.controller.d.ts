import { JobsService, JobStatsResponse } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { Job } from './entities/job.entity';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto): Promise<Job>;
    getStats(): Promise<JobStatsResponse>;
    getMetrics(): Promise<JobStatsResponse>;
    findAll(query: JobQueryDto): Promise<Job[]>;
    findOne(id: string): Promise<Job>;
    updateStatus(id: string, updateJobStatusDto: UpdateJobStatusDto): Promise<Job>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    simulate(id: string): Promise<{
        message: string;
    }>;
}
