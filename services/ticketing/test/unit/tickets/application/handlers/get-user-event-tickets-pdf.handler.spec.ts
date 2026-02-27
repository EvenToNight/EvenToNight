import { Test, TestingModule } from '@nestjs/testing';
import { GetUserEventTicketsPdfHandler } from 'src/tickets/application/handlers/get-user-event-tickets-pdf.handler';
import { TicketService } from 'src/tickets/application/services/ticket.service';
import { EventService } from 'src/tickets/application/services/event.service';
import { UserService } from 'src/tickets/application/services/user.service';
import { PdfService } from 'src/tickets/application/services/pdf.service';
import { Ticket } from 'src/tickets/domain/aggregates/ticket.aggregate';
import { Event } from 'src/tickets/domain/aggregates/event.aggregate';
import { EventId } from 'src/tickets/domain/value-objects/event-id.vo';
import { UserId } from 'src/tickets/domain/value-objects/user-id.vo';
import { EventTicketTypeId } from 'src/tickets/domain/value-objects/event-ticket-type-id.vo';
import { Money } from 'src/tickets/domain/value-objects/money.vo';
import { TicketStatus } from 'src/tickets/domain/value-objects/ticket-status.vo';
import { EventStatus } from 'src/tickets/domain/value-objects/event-status.vo';
import { TicketsNotFoundException } from 'src/tickets/domain/exceptions/tickets-not-found.exception';
import { EventNotFoundException } from 'src/tickets/domain/exceptions/event-not-found.exception';
import { UserNotFoundException } from 'src/tickets/domain/exceptions/user-not-found.exception';

describe('GetUserEventTicketsPdfHandler', () => {
  let handler: GetUserEventTicketsPdfHandler;
  let ticketService: jest.Mocked<Pick<TicketService, 'findByUserIdAndEventId'>>;
  let eventService: jest.Mocked<Pick<EventService, 'findById'>>;
  let userService: jest.Mocked<Pick<UserService, 'getUserLanguage'>>;
  let pdfService: jest.Mocked<Pick<PdfService, 'generateTicketsPdf'>>;

  const userId = 'user-123';
  const eventId = 'event-456';

  const makeTicket = (): Ticket =>
    Ticket.create({
      eventId: EventId.fromString(eventId),
      userId: UserId.fromString(userId),
      attendeeName: 'Test Attendee',
      ticketTypeId: EventTicketTypeId.fromString('type-1'),
      price: Money.fromAmount(10, 'USD'),
      status: TicketStatus.ACTIVE,
    });

  const makeEvent = (title?: string): Event =>
    Event.create({
      id: EventId.fromString(eventId),
      creatorId: UserId.fromString('creator-1'),
      status: EventStatus.PUBLISHED,
      date: new Date('2025-12-01'),
      title,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserEventTicketsPdfHandler,
        {
          provide: TicketService,
          useValue: { findByUserIdAndEventId: jest.fn() },
        },
        { provide: EventService, useValue: { findById: jest.fn() } },
        { provide: UserService, useValue: { getUserLanguage: jest.fn() } },
        { provide: PdfService, useValue: { generateTicketsPdf: jest.fn() } },
      ],
    }).compile();

    handler = module.get(GetUserEventTicketsPdfHandler);
    ticketService = module.get(TicketService);
    eventService = module.get(EventService);
    userService = module.get(UserService);
    pdfService = module.get(PdfService);
  });

  describe('Given no ACTIVE tickets for the user and event', () => {
    it('throws TicketsNotFoundException without calling downstream services', async () => {
      ticketService.findByUserIdAndEventId.mockResolvedValue([]);

      await expect(handler.handle(userId, eventId)).rejects.toThrow(
        TicketsNotFoundException,
      );
      expect(eventService.findById).not.toHaveBeenCalled();
      expect(userService.getUserLanguage).not.toHaveBeenCalled();
    });
  });

  describe('Given tickets exist but the event does not', () => {
    it('throws EventNotFoundException without calling userService', async () => {
      ticketService.findByUserIdAndEventId.mockResolvedValue([makeTicket()]);
      eventService.findById.mockResolvedValue(null);

      await expect(handler.handle(userId, eventId)).rejects.toThrow(
        EventNotFoundException,
      );
      expect(userService.getUserLanguage).not.toHaveBeenCalled();
    });
  });

  describe('Given the user is deleted between ticket fetch and language fetch', () => {
    it('propagates UserNotFoundException without generating the PDF', async () => {
      ticketService.findByUserIdAndEventId.mockResolvedValue([makeTicket()]);
      eventService.findById.mockResolvedValue(makeEvent('Test Event'));
      userService.getUserLanguage.mockRejectedValue(
        new UserNotFoundException(userId),
      );

      await expect(handler.handle(userId, eventId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(pdfService.generateTicketsPdf).not.toHaveBeenCalled();
    });
  });

  describe('Given all dependencies resolve correctly', () => {
    it('returns the PDF buffer and correct filename', async () => {
      const ticket = makeTicket();
      const pdfBuffer = Buffer.from('pdf-content');

      ticketService.findByUserIdAndEventId.mockResolvedValue([ticket]);
      eventService.findById.mockResolvedValue(makeEvent('Test Event'));
      userService.getUserLanguage.mockResolvedValue('en');
      pdfService.generateTicketsPdf.mockResolvedValue(pdfBuffer);

      const result = await handler.handle(userId, eventId);

      expect(result.buffer).toBe(pdfBuffer);
      expect(result.filename).toBe(`tickets-${userId}-${eventId}.pdf`);
    });

    it('passes correct ticketPdfData to pdfService', async () => {
      const ticket = makeTicket();

      ticketService.findByUserIdAndEventId.mockResolvedValue([ticket]);
      eventService.findById.mockResolvedValue(makeEvent('Test Event'));
      userService.getUserLanguage.mockResolvedValue('it');
      pdfService.generateTicketsPdf.mockResolvedValue(Buffer.from(''));

      await handler.handle(userId, eventId);

      expect(pdfService.generateTicketsPdf).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            ticketId: ticket.getId().toString(),
            attendeeName: 'Test Attendee',
            priceLabel: '10 USD',
            eventTitle: 'Test Event',
          }),
        ]),
        'it',
      );
    });

    it('falls back to "EventoNight" when event has no title', async () => {
      ticketService.findByUserIdAndEventId.mockResolvedValue([makeTicket()]);
      eventService.findById.mockResolvedValue(makeEvent());
      userService.getUserLanguage.mockResolvedValue('en');
      pdfService.generateTicketsPdf.mockResolvedValue(Buffer.from(''));

      await handler.handle(userId, eventId);

      expect(pdfService.generateTicketsPdf).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ eventTitle: 'EventoNight' }),
        ]),
        'en',
      );
    });
  });
});
