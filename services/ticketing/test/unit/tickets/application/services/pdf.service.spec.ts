import {
  PdfService,
  TicketPdfData,
} from 'src/tickets/application/services/pdf.service';

const baseTicket: TicketPdfData = {
  ticketId: 'ticket-1',
  eventId: 'event-1',
  eventTitle: 'Test Event',
  attendeeName: 'Test Attendee',
  eventDate: new Date('2025-12-01'),
  purchaseDate: new Date('2025-11-01'),
  priceLabel: '€50',
};

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    service = new PdfService();
  });

  describe('generateTicketPdf', () => {
    it('generates a PDF buffer for a single ticket (covers lines 69-79)', async () => {
      const buffer = await service.generateTicketPdf(baseTicket);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('generates a PDF when eventDate is a string (covers string branch)', async () => {
      const ticket: TicketPdfData = {
        ...baseTicket,
        eventDate: '2025-12-01T00:00:00Z',
        purchaseDate: '2025-11-01T00:00:00Z',
        priceLabel: undefined,
      };

      const buffer = await service.generateTicketPdf(ticket, 'it');

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('generates a PDF when eventDate is undefined (covers falsy eventDate branch)', async () => {
      const ticket: TicketPdfData = {
        ...baseTicket,
        eventDate: undefined,
        priceLabel: undefined,
      };

      const buffer = await service.generateTicketPdf(ticket);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('generates a PDF using https protocol when HOST is a non-localhost domain (covers line 54 https branch)', async () => {
      const originalHost = process.env.HOST;
      process.env.HOST = 'api.example.com';

      try {
        const buffer = await service.generateTicketPdf(baseTicket);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      } finally {
        process.env.HOST = originalHost;
      }
    });
  });

  describe('generateTicketsPdf', () => {
    it('generates a PDF for multiple tickets using the default locale (covers line 87 default branch)', async () => {
      // Call without locale to exercise the default 'en' parameter branch
      const buffer = await service.generateTicketsPdf([baseTicket, baseTicket]);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
