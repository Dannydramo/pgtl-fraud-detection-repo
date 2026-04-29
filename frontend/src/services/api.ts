import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
});

export interface JobResponse {
  jobId: string;
}

export interface JobStatusResponse {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalFlagged: number;
  error?: string;
}

export interface FlaggedTx {
  transactionId: string;
  userId: string;
  amount: number;
  timestamp: string;
  location: string;
  reasons: string[];
}

export interface PaginatedResults {
  page: number;
  limit: number;
  total: number;
  data: FlaggedTx[];
}

export async function uploadFraudFile(file: File): Promise<JobResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<JobResponse>('/fraud-check', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const { data } = await api.get<JobStatusResponse>(`/fraud-check/${jobId}`);
  return data;
}

export async function getJobResults(jobId: string, page = 1, limit = 20): Promise<PaginatedResults> {
  const { data } = await api.get<PaginatedResults>(`/fraud-check/${jobId}/results`, {
    params: { page, limit },
  });
  return data;
}
