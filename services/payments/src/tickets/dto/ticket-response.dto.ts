export class TicketResponseDto {
  ticketNumber: string;
  orderId: string;
  userId: string;
  eventId: string;
  categoryName: string;
  status: string;
  qrCode?: string;
  usedAt?: Date;
  createdAt: Date;
}

export class UseTicketDto {
  scannedBy?: string;
}
