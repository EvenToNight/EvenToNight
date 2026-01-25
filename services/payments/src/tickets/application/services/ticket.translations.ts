export const SUPPORTED_LOCALES = ['it', 'en', 'es', 'fr', 'de'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface TicketTranslations {
  title: string;
  ticketId: string;
  event: string;
  attendee: string;
  purchase: string;
  price: string;
}

export const TICKET_TRANSLATIONS: Record<SupportedLocale, TicketTranslations> =
  {
    it: {
      title: 'EventoNight - Biglietto',
      ticketId: 'ID Biglietto',
      event: 'Evento',
      attendee: 'Partecipante',
      purchase: 'Acquisto',
      price: 'Prezzo',
    },
    en: {
      title: 'EventoNight - Ticket',
      ticketId: 'Ticket ID',
      event: 'Event',
      attendee: 'Attendee',
      purchase: 'Purchase',
      price: 'Price',
    },
    es: {
      title: 'EventoNight - Entrada',
      ticketId: 'ID de Entrada',
      event: 'Evento',
      attendee: 'Asistente',
      purchase: 'Compra',
      price: 'Precio',
    },
    fr: {
      title: 'EventoNight - Billet',
      ticketId: 'ID du Billet',
      event: 'Événement',
      attendee: 'Participant',
      purchase: 'Achat',
      price: 'Prix',
    },
    de: {
      title: 'EventoNight - Ticket',
      ticketId: 'Ticket-ID',
      event: 'Veranstaltung',
      attendee: 'Teilnehmer',
      purchase: 'Kauf',
      price: 'Preis',
    },
  };
