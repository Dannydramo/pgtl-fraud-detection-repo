import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { FraudService } from './fraud.service';

@Controller('fraud-check')
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const fileName = `${Date.now()}-${randomUUID()}${extname(file.originalname || '.json')}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadAndQueue(@UploadedFile() file: Express.Multer.File) {
    return this.fraudService.createFraudJob(file.path);
  }

  @Get(':jobId')
  getJob(@Param('jobId') jobId: string) {
    return this.fraudService.getJob(jobId);
  }

  @Get(':jobId/results')
  getResults(
    @Param('jobId') jobId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.fraudService.getResults(jobId, page, limit);
  }
}
