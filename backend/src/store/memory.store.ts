import { Injectable } from '@nestjs/common';
import { FlaggedTransaction, JobState } from '../fraud/fraud.types';

@Injectable()
export class MemoryStore {
  public readonly jobs = new Map<string, JobState>();
  public readonly flagged = new Map<string, FlaggedTransaction[]>();
}
