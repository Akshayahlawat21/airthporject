import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../../common/enums/job-status.enum';

@Entity('jobs')
export class Job {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Unique Job ID (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Process Monthly Invoices', description: 'Job Title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ example: 'data-processing', description: 'Job Type' })
  @Column({ type: 'varchar', length: 100 })
  type: string;

  @ApiProperty({ enum: JobStatus, example: JobStatus.PENDING, description: 'Current Job Status' })
  @Column({
    type: 'text',
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @ApiProperty({ example: 'Database timeout', description: 'Failure reason if job failed', required: false })
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @ApiProperty({ example: 1, description: 'Version number for optimistic locking' })
  @VersionColumn({ default: 1 })
  version: number;

  @ApiProperty({ description: 'Job creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Job last updated timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
