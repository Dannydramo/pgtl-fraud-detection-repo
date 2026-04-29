import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { Transaction } from '../fraud/fraud.types';

@Injectable()
export class JsonStreamService {
  async processFile(
    filePath: string,
    onTransaction: (tx: Transaction) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const pipeline = chain([createReadStream(filePath), parser(), streamArray()]);

      pipeline.on('data', ({ value }: { value: Transaction }) => {
        onTransaction(value);
      });

      pipeline.on('end', () => resolve());
      pipeline.on('error', (error) => reject(error));
    });
  }
}
