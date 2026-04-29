import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { FraudDetector } from '../fraud/fraud.detector';
import { JsonStreamService } from '../file/json-stream.service';
import { MemoryStore } from '../store/memory.store';
import { FlaggedTransaction, JobState, Transaction } from '../fraud/fraud.types';
import { getRedisConnection } from './redis.connection';

interface FraudJobPayload {
  jobId: string;
  filePath: string;
}

@Injectable()
export class FraudWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker;
  private readonly logger = new Logger(FraudWorker.name);

  constructor(
    private readonly detector: FraudDetector,
    private readonly jsonStreamService: JsonStreamService,
    private readonly memoryStore: MemoryStore,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker(
      'fraud',
      async (job: Job<FraudJobPayload>) => this.processJob(job),
      {
        connection: getRedisConnection(),
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }

  private async processJob(job: Job<FraudJobPayload>): Promise<void> {
    const { jobId, filePath } = job.data;
    this.memoryStore.jobs.set(jobId, {
      status: 'PROCESSING',
      totalFlagged: 0,
    });
    this.memoryStore.flagged.set(jobId, []);

    try {
      let processed = 0;
      const context = this.detector.createContext();
      await this.jsonStreamService.processFile(filePath, (tx: Transaction) => {
        const flagged = this.detector.evaluate(context, tx);
        if (flagged) {
          const list = this.memoryStore.flagged.get(jobId) ?? [];
          list.push(flagged as FlaggedTransaction);
          this.memoryStore.flagged.set(jobId, list);
        }
        processed += 1;
        if (processed % 10_000 === 0) {
          this.detector.cleanup(context, new Date(tx.timestamp).getTime());
        }
      });

      const totalFlagged = this.memoryStore.flagged.get(jobId)?.length ?? 0;
      this.memoryStore.jobs.set(jobId, {
        status: 'COMPLETED',
        totalFlagged,
      });
    } catch (error) {
      const failedState: JobState = {
        status: 'FAILED',
        totalFlagged: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      this.memoryStore.jobs.set(jobId, failedState);
      this.logger.error(`Job ${jobId} failed`, error as Error);
      throw error;
    }
  }
}
