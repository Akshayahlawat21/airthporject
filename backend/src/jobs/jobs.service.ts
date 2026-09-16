import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { JobStatus } from '../common/enums/job-status.enum';
import { JobStateMachine } from './state-machine/job-state-machine';

export interface JobStatsResponse {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Creates a new job with default PENDING status.
   */
  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      title: createJobDto.title.trim(),
      type: createJobDto.type.trim(),
      status: JobStatus.PENDING,
      version: 1,
    });

    const savedJob = await this.jobRepository.save(job);
    this.logger.log(`Created new job: [${savedJob.id}] "${savedJob.title}" (${savedJob.type})`);

    if (createJobDto.autoSimulate) {
      this.triggerSimulation(savedJob.id);
    }

    return savedJob;
  }

  /**
   * Retrieves all jobs matching optional status filter or search keyword.
   */
  async findAll(query?: JobQueryDto): Promise<Job[]> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (query?.status) {
      queryBuilder.andWhere('job.status = :status', { status: query.status });
    }

    if (query?.search && query.search.trim()) {
      const searchTerm = `%${query.search.trim()}%`;
      queryBuilder.andWhere(
        '(LOWER(job.title) LIKE LOWER(:search) OR LOWER(job.type) LIKE LOWER(:search))',
        { search: searchTerm },
      );
    }

    queryBuilder.orderBy('job.createdAt', 'DESC');
    return await queryBuilder.getMany();
  }

  /**
   * Retrieves a single job by ID.
   */
  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID '${id}' was not found.`);
    }
    return job;
  }

  /**
   * Aggregates job counts by status.
   */
  async getStats(): Promise<JobStatsResponse> {
    const rawCounts = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(job.id)', 'count')
      .groupBy('job.status')
      .getRawMany();

    const stats: JobStatsResponse = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    for (const row of rawCounts) {
      const count = parseInt(row.count, 10) || 0;
      if (row.status in stats) {
        (stats as any)[row.status] = count;
      }
      stats.total += count;
    }

    return stats;
  }

  /**
   * Transitions a job's status with atomic optimistic concurrency control.
   *
   * Prevents race conditions when concurrent requests attempt state transitions
   * by validating state machine rules and executing an atomic conditional UPDATE:
   * UPDATE jobs SET status = :targetStatus, version = version + 1
   * WHERE id = :id AND status = :expectedStatus AND version = :expectedVersion
   */
  async updateStatus(
    id: string,
    updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    // 1. Fetch current snapshot of the job
    const currentJob = await this.findOne(id);

    // 2. Validate state machine transition logic (throws BadRequestException if illegal)
    JobStateMachine.validateTransition(
      currentJob.status,
      updateJobStatusDto.status,
    );

    // 3. Perform atomic conditional update protected by optimistic locking
    const updatePayload: Partial<Job> = {
      status: updateJobStatusDto.status,
      updatedAt: new Date(),
    };

    if (updateJobStatusDto.status === JobStatus.FAILED) {
      updatePayload.errorMessage =
        updateJobStatusDto.errorMessage || 'Job failed during execution.';
    } else if (updateJobStatusDto.status === JobStatus.COMPLETED) {
      updatePayload.errorMessage = undefined;
    }

    const updateResult = await this.jobRepository
      .createQueryBuilder()
      .update(Job)
      .set({
        ...updatePayload,
        version: () => 'version + 1',
      })
      .where('id = :id AND status = :expectedStatus AND version = :expectedVersion', {
        id,
        expectedStatus: currentJob.status,
        expectedVersion: currentJob.version,
      })
      .execute();

    // 4. If no rows were updated, a race condition occurred!
    if (updateResult.affected === 0) {
      const refreshedJob = await this.jobRepository.findOne({ where: { id } });
      if (!refreshedJob) {
        throw new NotFoundException(`Job with ID '${id}' was deleted by another process.`);
      }

      this.logger.warn(
        `[Concurrency Conflict] Transition rejected for job ${id}. Attempted transition from '${currentJob.status}' (v${currentJob.version}) to '${updateJobStatusDto.status}', but current state is '${refreshedJob.status}' (v${refreshedJob.version}).`,
      );

      throw new ConflictException(
        `Concurrency Conflict: Job '${id}' has already been transitioned to '${refreshedJob.status}' (version ${refreshedJob.version}) by a concurrent request. Action aborted to preserve state consistency.`,
      );
    }

    this.logger.log(
      `Job [${id}] transitioned: '${currentJob.status}' -> '${updateJobStatusDto.status}' (version ${currentJob.version + 1})`,
    );

    return await this.findOne(id);
  }

  /**
   * Deletes a job by ID.
   */
  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
    this.logger.log(`Deleted job: [${id}] "${job.title}"`);
    return {
      success: true,
      message: `Job '${id}' (${job.title}) successfully deleted.`,
    };
  }

  /**
   * Background simulated worker to process a job asynchronously.
   */
  triggerSimulation(id: string): void {
    setTimeout(async () => {
      try {
        const job = await this.jobRepository.findOne({ where: { id } });
        if (!job || job.status !== JobStatus.PENDING) return;

        // Transition: pending -> running
        await this.updateStatus(id, { status: JobStatus.RUNNING });

        // Simulate work for 3 seconds
        setTimeout(async () => {
          try {
            const runningJob = await this.jobRepository.findOne({ where: { id } });
            if (!runningJob || runningJob.status !== JobStatus.RUNNING) return;

            // 90% success, 10% simulated failure
            const shouldFail = Math.random() < 0.1;
            if (shouldFail) {
              await this.updateStatus(id, {
                status: JobStatus.FAILED,
                errorMessage: 'Simulated worker encountered an unhandled pipeline error',
              });
            } else {
              await this.updateStatus(id, { status: JobStatus.COMPLETED });
            }
          } catch (err: any) {
            this.logger.warn(`Simulation completion error for job ${id}: ${err.message}`);
          }
        }, 3000);
      } catch (err: any) {
        this.logger.warn(`Simulation start error for job ${id}: ${err.message}`);
      }
    }, 1000);
  }
}
