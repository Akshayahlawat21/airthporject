import { Job, JobStats, CreateJobInput, UpdateJobStatusInput } from '../types/job';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

class ApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data !== null && data.message)
          ? Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message
          : response.statusText || 'An unexpected error occurred';

      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  async getJobs(params?: { status?: string; search?: string }): Promise<Job[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      query.append('status', params.status);
    }
    if (params?.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/jobs${queryString}`);
    return this.handleResponse<Job[]>(res);
  }

  async getStats(): Promise<JobStats> {
    const res = await fetch(`${API_BASE_URL}/jobs/stats`);
    return this.handleResponse<JobStats>(res);
  }

  async getJobById(id: string): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
    return this.handleResponse<Job>(res);
  }

  async createJob(input: CreateJobInput): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Job>(res);
  }

  async updateJobStatus(id: string, input: UpdateJobStatusInput): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return this.handleResponse<Job>(res);
  }

  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse<{ success: boolean; message: string }>(res);
  }

  async triggerSimulation(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/simulate`, {
      method: 'POST',
    });
    return this.handleResponse<{ message: string }>(res);
  }
}

export const api = new ApiService();
