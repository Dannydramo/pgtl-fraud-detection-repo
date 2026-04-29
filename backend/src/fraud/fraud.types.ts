export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  timestamp: string;
  location: string;
}

export interface FlaggedTransaction extends Transaction {
  reasons: string[];
}

export interface JobState {
  status: JobStatus;
  totalFlagged: number;
  error?: string;
}
