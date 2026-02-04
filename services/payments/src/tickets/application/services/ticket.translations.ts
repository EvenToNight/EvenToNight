export const SUPPORTED_LOCALES = ['it', 'en', 'es', 'fr', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface TicketTranslations {
  ticket: string;
  ticketId: string;
  event: string;
  eventDate: string;
  attendee: string;
  purchase: string;
  price: string;
}

export const TICKET_TRANSLATIONS: Record<SupportedLocale, TicketTranslations> =
  {
    it: {
      ticket: 'Biglietto',
      ticketId: 'ID Biglietto',
      event: 'Evento',
      eventDate: "Data dell'evento",
      attendee: 'Partecipante',
      purchase: 'Acquistato il',
      price: 'Prezzo',
    },
    en: {
      ticket: 'Ticket',
      ticketId: 'Ticket ID',
      event: 'Event',
      eventDate: 'Event Date',
      attendee: 'Attendee',
      purchase: 'Purchased on',
      price: 'Price',
    },
    es: {
      ticket: 'Entrada',
      ticketId: 'ID de Entrada',
      event: 'Evento',
      eventDate: 'Fecha del Evento',
      attendee: 'Asistente',
      purchase: 'Comprado el',
      price: 'Precio',
    },
    fr: {
      ticket: 'Billet',
      ticketId: 'ID du Billet',
      event: 'Événement',
      eventDate: "Date de l'événement",
      attendee: 'Participant',
      purchase: 'Acheté le',
      price: 'Prix',
    },
    de: {
      ticket: 'Ticket',
      ticketId: 'Ticket-ID',
      event: 'Veranstaltung',
      eventDate: 'Veranstaltungsdatum',
      attendee: 'Teilnehmer',
      purchase: 'Gekauft am',
      price: 'Preis',
    },
  };
