import { BadRequestException } from '@nestjs/common';
import { JobStatus } from '../../common/enums/job-status.enum';
import { JobStateMachine } from './job-state-machine';

describe('JobStateMachine', () => {
  describe('Valid Transitions', () => {
    it('should allow pending -> running', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.PENDING, JobStatus.RUNNING),
      ).not.toThrow();
      expect(
        JobStateMachine.isValidTransition(JobStatus.PENDING, JobStatus.RUNNING),
      ).toBe(true);
    });

    it('should allow running -> completed', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.RUNNING, JobStatus.COMPLETED),
      ).not.toThrow();
      expect(
        JobStateMachine.isValidTransition(JobStatus.RUNNING, JobStatus.COMPLETED),
      ).toBe(true);
    });

    it('should allow running -> failed', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.RUNNING, JobStatus.FAILED),
      ).not.toThrow();
      expect(
        JobStateMachine.isValidTransition(JobStatus.RUNNING, JobStatus.FAILED),
      ).toBe(true);
    });
  });

  describe('Invalid Transitions', () => {
    it('should reject pending -> completed', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.PENDING, JobStatus.COMPLETED),
      ).toThrow(BadRequestException);
      expect(
        JobStateMachine.isValidTransition(JobStatus.PENDING, JobStatus.COMPLETED),
      ).toBe(false);
    });

    it('should reject pending -> failed', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.PENDING, JobStatus.FAILED),
      ).toThrow(BadRequestException);
      expect(
        JobStateMachine.isValidTransition(JobStatus.PENDING, JobStatus.FAILED),
      ).toBe(false);
    });

    it('should reject running -> pending', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.RUNNING, JobStatus.PENDING),
      ).toThrow(BadRequestException);
      expect(
        JobStateMachine.isValidTransition(JobStatus.RUNNING, JobStatus.PENDING),
      ).toBe(false);
    });

    it('should reject completed -> running (terminal constraint)', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.COMPLETED, JobStatus.RUNNING),
      ).toThrow(BadRequestException);
      expect(
        JobStateMachine.isValidTransition(JobStatus.COMPLETED, JobStatus.RUNNING),
      ).toBe(false);
    });

    it('should reject completed -> failed', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.COMPLETED, JobStatus.FAILED),
      ).toThrow(BadRequestException);
      expect(
        JobStateMachine.isValidTransition(JobStatus.COMPLETED, JobStatus.FAILED),
      ).toBe(false);
    });

    it('should reject failed -> running (terminal constraint)', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.FAILED, JobStatus.RUNNING),
      ).toThrow(BadRequestException);
      expect(
        JobStateMachine.isValidTransition(JobStatus.FAILED, JobStatus.RUNNING),
      ).toBe(false);
    });

    it('should reject same-state transition', () => {
      expect(() =>
        JobStateMachine.validateTransition(JobStatus.RUNNING, JobStatus.RUNNING),
      ).toThrow(BadRequestException);
    });
  });

  describe('Allowed transitions list', () => {
    it('should return [RUNNING] for PENDING', () => {
      expect(JobStateMachine.getAllowedTransitions(JobStatus.PENDING)).toEqual([
        JobStatus.RUNNING,
      ]);
    });

    it('should return [COMPLETED, FAILED] for RUNNING', () => {
      expect(JobStateMachine.getAllowedTransitions(JobStatus.RUNNING)).toEqual([
        JobStatus.COMPLETED,
        JobStatus.FAILED,
      ]);
    });

    it('should return [] for COMPLETED and FAILED', () => {
      expect(JobStateMachine.getAllowedTransitions(JobStatus.COMPLETED)).toEqual([]);
      expect(JobStateMachine.getAllowedTransitions(JobStatus.FAILED)).toEqual([]);
    });
  });
});
