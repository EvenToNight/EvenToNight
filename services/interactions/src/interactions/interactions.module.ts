import { Module } from '@nestjs/common';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [UserModule],
})
export class InteractionsModule {}
