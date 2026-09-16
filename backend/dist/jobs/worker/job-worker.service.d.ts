import { JobsService } from '../jobs.service';
export declare class JobWorkerService {
    private readonly jobsService;
    private readonly logger;
    constructor(jobsService: JobsService);
    simulateJobExecution(jobId: string, durationMs?: number): Promise<void>;
}
