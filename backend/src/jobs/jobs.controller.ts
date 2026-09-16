import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JobsService, JobStatsResponse } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { Job } from './entities/job.entity';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job successfully created',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed on input fields',
  })
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return await this.jobsService.create(createJobDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregate counts by status for dashboard' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job count statistics by status',
  })
  async getStats(): Promise<JobStatsResponse> {
    return await this.jobsService.getStats();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Alias for /jobs/stats metrics endpoint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job count statistics by status',
  })
  async getMetrics(): Promise<JobStatsResponse> {
    return await this.jobsService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with optional status filter & search' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of jobs matching query parameters',
    type: [Job],
  })
  async findAll(@Query() query: JobQueryDto): Promise<Job[]> {
    return await this.jobsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific job by ID' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job details',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job with given ID not found',
  })
  async findOne(@Param('id') id: string): Promise<Job> {
    return await this.jobsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update job status with strict state machine validation and concurrency protection',
  })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job status successfully updated',
    type: Job,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid state transition attempted according to state machine rules',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Race condition detected: another process updated the job status simultaneously',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    return await this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job by ID' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Job successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Job not found',
  })
  async remove(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return await this.jobsService.remove(id);
  }

  @Post(':id/simulate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger simulated background worker execution for a job' })
  @ApiParam({ name: 'id', description: 'Job UUID' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Background simulation triggered',
  })
  async simulate(@Param('id') id: string): Promise<{ message: string }> {
    this.jobsService.triggerSimulation(id);
    return { message: `Background execution triggered for job '${id}'` };
  }
}
