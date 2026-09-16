export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  errorMessage?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

export interface CreateJobInput {
  title: string;
  type: string;
  autoSimulate?: boolean;
}

export interface UpdateJobStatusInput {
  status: JobStatus;
  errorMessage?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
