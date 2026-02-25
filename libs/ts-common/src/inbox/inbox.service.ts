import { InboxService } from './inbox.service.interface';
import { InboxRepository } from './inbox.repository.interface';

export class InboxServiceImpl implements InboxService {
  constructor(protected readonly inboxRepository: InboxRepository) {}
  

  async isProcessed(key: string): Promise<boolean> {
    const doc = await this.inboxRepository.find(key);
    return !!doc;
  }

  async markAsProcessed(key: string): Promise<void> {
    return this.inboxRepository.save({
      id: key,
      processedAt: new Date(),
    });
  }
}
