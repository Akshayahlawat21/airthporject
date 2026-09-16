import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JobStatus } from '../../common/enums/job-status.enum';

export class JobQueryDto {
  @ApiPropertyOptional({
    enum: JobStatus,
    description: 'Filter jobs by status (pending, running, completed, failed)',
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({
    description: 'Search keyword matching job title or type',
    example: 'invoice',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
