import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { IsIn, IsString } from 'class-validator';

export class InvalidateTicketStatusDto {
  @IsString()
  @IsIn([TicketStatus.USED.toString()], {
    message: 'Only status=invalid is allowed',
  })
  status: string = TicketStatus.USED.toString();
}
