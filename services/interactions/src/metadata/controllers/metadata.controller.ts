import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MetadataService } from '../services/metadata.service';

// controller to handle rabbit communication for metadata updates
@Controller()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}
}
