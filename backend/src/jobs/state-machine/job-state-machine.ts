import { BadRequestException } from '@nestjs/common';
import { JobStatus } from '../../common/enums/job-status.enum';

/**
 * Finite State Machine (FSM) defining valid status transitions for a Job.
 *
 * Rules:
 *   - pending   -> running
 *   - running   -> completed | failed
 *   - completed -> (terminal - no transitions allowed)
 *   - failed    -> (terminal - no transitions allowed)
 */
export class JobStateMachine {
  private static readonly TRANSITION_MAP: Record<JobStatus, JobStatus[]> = {
    [JobStatus.PENDING]: [JobStatus.RUNNING],
    [JobStatus.RUNNING]: [JobStatus.COMPLETED, JobStatus.FAILED],
    [JobStatus.COMPLETED]: [],
    [JobStatus.FAILED]: [],
  };

  /**
   * Returns list of valid next statuses for a given current status.
   */
  public static getAllowedTransitions(currentStatus: JobStatus): JobStatus[] {
    return this.TRANSITION_MAP[currentStatus] || [];
  }

  /**
   * Checks if transition from currentStatus to targetStatus is permitted.
   */
  public static isValidTransition(
    currentStatus: JobStatus,
    targetStatus: JobStatus,
  ): boolean {
    const allowed = this.getAllowedTransitions(currentStatus);
    return allowed.includes(targetStatus);
  }

  /**
   * Validates transition and throws descriptive BadRequestException if illegal.
   */
  public static validateTransition(
    currentStatus: JobStatus,
    targetStatus: JobStatus,
  ): void {
    if (currentStatus === targetStatus) {
      throw new BadRequestException(
        `Job is already in '${currentStatus}' status. No state change performed.`,
      );
    }

    if (
      currentStatus === JobStatus.COMPLETED ||
      currentStatus === JobStatus.FAILED
    ) {
      throw new BadRequestException(
        `Cannot transition terminal status '${currentStatus}' to '${targetStatus}'. Terminal states cannot be modified.`,
      );
    }

    if (!this.isValidTransition(currentStatus, targetStatus)) {
      const allowed = this.getAllowedTransitions(currentStatus);
      const allowedStr =
        allowed.length > 0
          ? allowed.map((s) => `'${s}'`).join(' or ')
          : 'none (terminal state)';
      throw new BadRequestException(
        `Invalid state transition: Cannot transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions from '${currentStatus}' are: ${allowedStr}.`,
      );
    }
  }
}
