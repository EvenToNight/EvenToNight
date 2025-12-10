import { Module } from '@nestjs/common';
import { SocialModule } from 'src/social/social.module';

@Module({
  imports: [SocialModule],
})
export class InteractionsModule {}
