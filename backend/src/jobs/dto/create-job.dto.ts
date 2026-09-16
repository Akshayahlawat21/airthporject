import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    example: 'Process Monthly Invoices',
    description: 'The title or task description for the job',
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  title: string;

  @ApiProperty({
    example: 'data-processing',
    description: 'The category or type of work this job performs',
  })
  @IsNotEmpty({ message: 'Type is required' })
  @IsString({ message: 'Type must be a string' })
  @MaxLength(100, { message: 'Type cannot exceed 100 characters' })
  type: string;

  @ApiPropertyOptional({
    example: false,
    description: 'If true, automatically triggers simulated asynchronous background execution',
  })
  @IsOptional()
  @IsBoolean({ message: 'autoSimulate must be a boolean' })
  autoSimulate?: boolean;
}
