import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { JobStatus } from '../common/enums/job-status.enum';

describe('JobsService (State Machine & Concurrency Control)', () => {
  let service: JobsService;
  let repo: Repository<Job>;

  const mockJob: Job = {
    id: 'mock-uuid-1',
    title: 'Process Analytics Ingest',
    type: 'data-processing',
    status: JobStatus.PENDING,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'mock-uuid-1', status: JobStatus.PENDING, version: 1 })),
    save: jest.fn().mockImplementation((job) => Promise.resolve(job)),
    findOne: jest.fn(),
    remove: jest.fn().mockImplementation((job) => Promise.resolve(job)),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    repo = module.get<Repository<Job>>(getRepositoryToken(Job));
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a job in PENDING status with version 1', async () => {
      const result = await service.create({
        title: 'New Data Job',
        type: 'data-processing',
      });

      expect(result.status).toBe(JobStatus.PENDING);
      expect(result.version).toBe(1);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('State Machine Transitions', () => {
    it('should successfully transition: pending -> running', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING, version: 1 };
      mockRepository.findOne
        .mockResolvedValueOnce(pendingJob) // for initial findOne
        .mockResolvedValueOnce({ ...pendingJob, status: JobStatus.RUNNING, version: 2 }); // for return findOne

      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      const updated = await service.updateStatus('mock-uuid-1', {
        status: JobStatus.RUNNING,
      });

      expect(updated.status).toBe(JobStatus.RUNNING);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should successfully transition: running -> completed', async () => {
      const runningJob = { ...mockJob, status: JobStatus.RUNNING, version: 2 };
      mockRepository.findOne
        .mockResolvedValueOnce(runningJob)
        .mockResolvedValueOnce({ ...runningJob, status: JobStatus.COMPLETED, version: 3 });

      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      const updated = await service.updateStatus('mock-uuid-1', {
        status: JobStatus.COMPLETED,
      });

      expect(updated.status).toBe(JobStatus.COMPLETED);
    });

    it('should successfully transition: running -> failed with error message', async () => {
      const runningJob = { ...mockJob, status: JobStatus.RUNNING, version: 2 };
      mockRepository.findOne
        .mockResolvedValueOnce(runningJob)
        .mockResolvedValueOnce({
          ...runningJob,
          status: JobStatus.FAILED,
          errorMessage: 'Memory allocation failed',
          version: 3,
        });

      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 1 });

      const updated = await service.updateStatus('mock-uuid-1', {
        status: JobStatus.FAILED,
        errorMessage: 'Memory allocation failed',
      });

      expect(updated.status).toBe(JobStatus.FAILED);
      expect(updated.errorMessage).toBe('Memory allocation failed');
    });

    it('should REJECT illegal transition: pending -> completed (skipping running)', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING, version: 1 };
      mockRepository.findOne.mockResolvedValueOnce(pendingJob);

      await expect(
        service.updateStatus('mock-uuid-1', { status: JobStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should REJECT mutation from terminal state: completed -> running', async () => {
      const completedJob = { ...mockJob, status: JobStatus.COMPLETED, version: 3 };
      mockRepository.findOne.mockResolvedValueOnce(completedJob);

      await expect(
        service.updateStatus('mock-uuid-1', { status: JobStatus.RUNNING }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should REJECT mutation from terminal state: failed -> running', async () => {
      const failedJob = { ...mockJob, status: JobStatus.FAILED, version: 3 };
      mockRepository.findOne.mockResolvedValueOnce(failedJob);

      await expect(
        service.updateStatus('mock-uuid-1', { status: JobStatus.RUNNING }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should REJECT transition to the same status: pending -> pending', async () => {
      const pendingJob = { ...mockJob, status: JobStatus.PENDING, version: 1 };
      mockRepository.findOne.mockResolvedValueOnce(pendingJob);

      await expect(
        service.updateStatus('mock-uuid-1', { status: JobStatus.PENDING }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Concurrency & Race Condition Handling', () => {
    it('should throw ConflictException (409) when atomic conditional update fails due to race condition', async () => {
      const initialJob = { ...mockJob, status: JobStatus.PENDING, version: 1 };
      const modifiedByAnotherJob = { ...mockJob, status: JobStatus.RUNNING, version: 2 };

      mockRepository.findOne
        .mockResolvedValueOnce(initialJob) // initial read
        .mockResolvedValueOnce(modifiedByAnotherJob); // read after affected = 0

      // Simulate zero rows affected because another transaction updated it first
      mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });

      await expect(
        service.updateStatus('mock-uuid-1', { status: JobStatus.RUNNING }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne() & remove()', () => {
    it('should throw NotFoundException when job does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should remove an existing job', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockJob);
      const res = await service.remove('mock-uuid-1');

      expect(res.success).toBe(true);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockJob);
    });
  });
});
