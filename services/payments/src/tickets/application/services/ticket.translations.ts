export const SUPPORTED_LOCALES = ['it', 'en', 'es', 'fr', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface TicketTranslations {
  ticket: string;
  ticketId: string;
  event: string;
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
      attendee: 'Partecipante',
      purchase: 'Acquisto',
      price: 'Prezzo',
    },
    en: {
      ticket: 'Ticket',
      ticketId: 'Ticket ID',
      event: 'Event',
      attendee: 'Attendee',
      purchase: 'Purchase',
      price: 'Price',
    },
    es: {
      ticket: 'Entrada',
      ticketId: 'ID de Entrada',
      event: 'Evento',
      attendee: 'Asistente',
      purchase: 'Compra',
      price: 'Precio',
    },
    fr: {
      ticket: 'Billet',
      ticketId: 'ID du Billet',
      event: 'Événement',
      attendee: 'Participant',
      purchase: 'Achat',
      price: 'Prix',
    },
    de: {
      ticket: 'Ticket',
      ticketId: 'Ticket-ID',
      event: 'Veranstaltung',
      attendee: 'Teilnehmer',
      purchase: 'Kauf',
      price: 'Preis',
    },
  };
