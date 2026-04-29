import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FraudQueue } from '../queue/fraud.queue';
import { MemoryStore } from '../store/memory.store';
import { FlaggedTransaction } from './fraud.types';

@Injectable()
export class FraudService {
  constructor(
    private readonly fraudQueue: FraudQueue,
    private readonly memoryStore: MemoryStore,
  ) {}

  async createFraudJob(filePath: string): Promise<{ jobId: string }> {
    const jobId = randomUUID();
    this.memoryStore.jobs.set(jobId, { status: 'PENDING', totalFlagged: 0 });
    this.memoryStore.flagged.set(jobId, []);
    await this.fraudQueue.addFraudJob(jobId, filePath);
    return { jobId };
  }

  getJob(jobId: string): { status: string; totalFlagged: number; error?: string } {
    const job = this.memoryStore.jobs.get(jobId);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  getResults(jobId: string, page: number, limit: number): {
    page: number;
    limit: number;
    total: number;
    data: FlaggedTransaction[];
  } {
    const job = this.memoryStore.jobs.get(jobId);
    if (!job) throw new NotFoundException('Job not found');
    const all = this.memoryStore.flagged.get(jobId) ?? [];
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);
    return {
      page,
      limit,
      total: all.length,
      data,
    };
  }
}
