import { Module, Global } from '@nestjs/common';
import { DatabaseTransactionService } from './database-transaction.service';

@Global()
@Module({
  providers: [DatabaseTransactionService],
  exports: [DatabaseTransactionService],
})
export class DatabaseModule {}
