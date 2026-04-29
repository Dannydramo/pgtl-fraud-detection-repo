import { Injectable } from '@nestjs/common';
import { FlaggedTransaction, Transaction } from './fraud.types';

interface UserState {
  oneMinuteWindow: number[];
  dailyTotal: number;
  dailyKey: string;
  lastTimestamp?: number;
  lastLocation?: string;
  lastSeen: number;
}

interface DetectionContext {
  userStates: Map<string, UserState>;
}

@Injectable()
export class FraudDetector {
  private readonly ONE_MINUTE_MS = 60_000;
  private readonly TWO_MINUTES_MS = 120_000;
  private readonly INACTIVE_EVICTION_MS = 48 * 60 * 60 * 1000;

  createContext(): DetectionContext {
    return { userStates: new Map<string, UserState>() };
  }

  evaluate(context: DetectionContext, transaction: Transaction): FlaggedTransaction | null {
    const txTime = new Date(transaction.timestamp).getTime();
    const userId = transaction.userId;
    const currentDay = new Date(txTime).toISOString().slice(0, 10);
    const state = context.userStates.get(userId) ?? {
      oneMinuteWindow: [],
      dailyTotal: 0,
      dailyKey: currentDay,
      lastSeen: txTime,
    };

    const reasons: string[] = [];

    while (
      state.oneMinuteWindow.length > 0 &&
      txTime - state.oneMinuteWindow[0] > this.ONE_MINUTE_MS
    ) {
      state.oneMinuteWindow.shift();
    }
    state.oneMinuteWindow.push(txTime);
    if (state.oneMinuteWindow.length > 5) {
      reasons.push('More than 5 transactions by same user within 1 minute');
    }

    if (state.dailyKey !== currentDay) {
      state.dailyKey = currentDay;
      state.dailyTotal = 0;
    }
    state.dailyTotal += Number(transaction.amount);
    if (state.dailyTotal > 10_000) {
      reasons.push('Daily transaction total exceeds $10,000');
    }

    if (
      state.lastTimestamp !== undefined &&
      state.lastLocation !== undefined &&
      state.lastLocation !== transaction.location &&
      txTime - state.lastTimestamp < this.TWO_MINUTES_MS
    ) {
      reasons.push('Transactions from different locations within 2 minutes');
    }

    state.lastTimestamp = txTime;
    state.lastLocation = transaction.location;
    state.lastSeen = txTime;
    context.userStates.set(userId, state);

    if (reasons.length === 0) return null;
    return {
      ...transaction,
      reasons,
    };
  }

  cleanup(context: DetectionContext, currentTimestamp: number): void {
    for (const [userId, state] of context.userStates.entries()) {
      if (currentTimestamp - state.lastSeen > this.INACTIVE_EVICTION_MS) {
        context.userStates.delete(userId);
      }
    }
  }
}
