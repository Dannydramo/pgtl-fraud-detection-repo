import { Module } from '@nestjs/common';
import { FraudController } from './fraud/fraud.controller';
import { FraudService } from './fraud/fraud.service';
import { FraudDetector } from './fraud/fraud.detector';
import { JsonStreamService } from './file/json-stream.service';
import { MemoryStore } from './store/memory.store';
import { FraudQueue } from './queue/fraud.queue';
import { FraudWorker } from './queue/fraud.worker';

@Module({
  imports: [],
  controllers: [FraudController],
  providers: [
    FraudService,
    FraudDetector,
    JsonStreamService,
    MemoryStore,
    FraudQueue,
    FraudWorker,
  ],
})
export class AppModule {}
