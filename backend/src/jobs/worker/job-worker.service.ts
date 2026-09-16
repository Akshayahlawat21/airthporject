import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { JobsService } from '../jobs.service';
import { JobStatus } from '../../common/enums/job-status.enum';

@Injectable()
export class JobWorkerService {
  private readonly logger = new Logger(JobWorkerService.name);

  constructor(
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService,
  ) {}

  /**
   * Simulates asynchronous worker execution for a given job.
   * Runs the job in the background, waits for simulated work duration,
   * and updates status to completed or failed.
   */
  public async simulateJobExecution(jobId: string, durationMs = 4000): Promise<void> {
    this.logger.log(`[Worker] Started background processing for Job ${jobId}`);

    // Run asynchronously without blocking HTTP response
    setTimeout(async () => {
      try {
        const job = await this.jobsService.findOne(jobId);
        if (!job) {
          this.logger.warn(`[Worker] Job ${jobId} not found, aborting background task.`);
          return;
        }

        // If still pending, transition to running first
        if (job.status === JobStatus.PENDING) {
          await this.jobsService.updateStatus(jobId, { status: JobStatus.RUNNING });
          this.logger.log(`[Worker] Job ${jobId} transitioned to RUNNING`);
        }

        // Simulate work
        await new Promise((resolve) => setTimeout(resolve, durationMs));

        // Randomly simulate occasional failure (15% chance) or completion (85% chance)
        const isSuccess = Math.random() > 0.15;
        if (isSuccess) {
          await this.jobsService.updateStatus(jobId, {
            status: JobStatus.COMPLETED,
          });
          this.logger.log(`[Worker] Job ${jobId} successfully COMPLETED`);
        } else {
          await this.jobsService.updateStatus(jobId, {
            status: JobStatus.FAILED,
            errorMessage: 'Simulated worker failure: upstream service timeout (504)',
          });
          this.logger.warn(`[Worker] Job ${jobId} simulated FAILED`);
        }
      } catch (err: any) {
        this.logger.error(`[Worker] Error processing job ${jobId}: ${err.message}`);
      }
    }, 100);
  }
}
