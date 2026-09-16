import { JobStatus } from '../../common/enums/job-status.enum';
export declare class UpdateJobStatusDto {
    status: JobStatus;
    errorMessage?: string;
}
