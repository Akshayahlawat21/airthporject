"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStateMachine = void 0;
const common_1 = require("@nestjs/common");
const job_status_enum_1 = require("../../common/enums/job-status.enum");
class JobStateMachine {
    static getAllowedTransitions(currentStatus) {
        return this.TRANSITION_MAP[currentStatus] || [];
    }
    static isValidTransition(currentStatus, targetStatus) {
        const allowed = this.getAllowedTransitions(currentStatus);
        return allowed.includes(targetStatus);
    }
    static validateTransition(currentStatus, targetStatus) {
        if (currentStatus === targetStatus) {
            throw new common_1.BadRequestException(`Job is already in '${currentStatus}' status. No state change performed.`);
        }
        if (currentStatus === job_status_enum_1.JobStatus.COMPLETED ||
            currentStatus === job_status_enum_1.JobStatus.FAILED) {
            throw new common_1.BadRequestException(`Cannot transition terminal status '${currentStatus}' to '${targetStatus}'. Terminal states cannot be modified.`);
        }
        if (!this.isValidTransition(currentStatus, targetStatus)) {
            const allowed = this.getAllowedTransitions(currentStatus);
            const allowedStr = allowed.length > 0
                ? allowed.map((s) => `'${s}'`).join(' or ')
                : 'none (terminal state)';
            throw new common_1.BadRequestException(`Invalid state transition: Cannot transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions from '${currentStatus}' are: ${allowedStr}.`);
        }
    }
}
exports.JobStateMachine = JobStateMachine;
JobStateMachine.TRANSITION_MAP = {
    [job_status_enum_1.JobStatus.PENDING]: [job_status_enum_1.JobStatus.RUNNING],
    [job_status_enum_1.JobStatus.RUNNING]: [job_status_enum_1.JobStatus.COMPLETED, job_status_enum_1.JobStatus.FAILED],
    [job_status_enum_1.JobStatus.COMPLETED]: [],
    [job_status_enum_1.JobStatus.FAILED]: [],
};
//# sourceMappingURL=job-state-machine.js.map