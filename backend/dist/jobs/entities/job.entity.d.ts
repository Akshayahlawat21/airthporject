import { JobStatus } from '../../common/enums/job-status.enum';
export declare class Job {
    id: string;
    title: string;
    type: string;
    status: JobStatus;
    errorMessage?: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
