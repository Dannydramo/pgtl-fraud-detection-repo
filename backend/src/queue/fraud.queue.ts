import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { getRedisConnection } from './redis.connection';

@Injectable()
export class FraudQueue implements OnModuleDestroy {
  private readonly queue: Queue;

  constructor() {
    this.queue = new Queue('fraud', {
      connection: getRedisConnection(),
    });
  }

  async addFraudJob(jobId: string, filePath: string): Promise<void> {
    await this.queue.add('fraud-check', { jobId, filePath }, { jobId });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
