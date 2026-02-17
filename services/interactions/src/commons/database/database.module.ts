import { Module, Global } from '@nestjs/common';
import { TransactionManagerService } from './transaction-manager.service';

@Global()
@Module({
  providers: [TransactionManagerService],
  exports: [TransactionManagerService],
})
export class TransactionManagerModule {}
