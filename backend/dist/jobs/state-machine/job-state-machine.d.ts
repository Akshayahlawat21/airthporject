import { JobStatus } from '../../common/enums/job-status.enum';
export declare class JobStateMachine {
    private static readonly TRANSITION_MAP;
    static getAllowedTransitions(currentStatus: JobStatus): JobStatus[];
    static isValidTransition(currentStatus: JobStatus, targetStatus: JobStatus): boolean;
    static validateTransition(currentStatus: JobStatus, targetStatus: JobStatus): void;
}
