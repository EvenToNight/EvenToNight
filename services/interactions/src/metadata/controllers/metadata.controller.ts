import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';

// controller to handle rabbit communication for metadata updates
@Controller()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  // Test connection to RabbitMQ
  @EventPattern('test.ping')
  async handleTestPing(@Payload() data: any) {
    console.log('🎉 TEST MESSAGE RECEIVED:', data);
    return { status: 'ok', receivedAt: new Date(), data };
  }
}
