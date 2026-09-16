import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JobStatus } from '../../common/enums/job-status.enum';

export class UpdateJobStatusDto {
  @ApiProperty({
    enum: JobStatus,
    example: JobStatus.RUNNING,
    description: 'Target status to transition the job into',
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(JobStatus, {
    message: `Status must be one of: ${Object.values(JobStatus).join(', ')}`,
  })
  status: JobStatus;

  @ApiPropertyOptional({
    example: 'Process crashed due to out of memory',
    description: 'Optional error explanation when transitioning to failed status',
  })
  @IsOptional()
  @IsString({ message: 'errorMessage must be a string' })
  errorMessage?: string;
}
