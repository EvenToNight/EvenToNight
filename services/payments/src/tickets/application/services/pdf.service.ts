import { Injectable } from '@nestjs/common';
import * as PDFKit from 'pdfkit';
import { toDataURL } from 'qrcode';

export interface TicketPdfData {
  ticketId: string;
  eventId: string;
  attendeeName: string;
  purchaseDate: Date | string;
  priceLabel?: string;
}

@Injectable()
export class PdfService {
  private async addTicketToDocument(
    doc: PDFKit.PDFDocument,
    ticket: TicketPdfData,
  ): Promise<void> {
    doc.fontSize(22).text('EventoNight - Biglietto', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`ID Biglietto: ${ticket.ticketId}`);
    doc.text(`Evento: ${ticket.eventId}`);
    doc.text(`Partecipante: ${ticket.attendeeName}`);
    doc.text(
      `Acquisto: ${
        typeof ticket.purchaseDate === 'string'
          ? ticket.purchaseDate
          : ticket.purchaseDate.toLocaleString()
      }`,
    );
    if (ticket.priceLabel) doc.text(`Prezzo: ${ticket.priceLabel}`);

    doc.moveDown();

    const qrUrl = 'https://eventonight.site';
    const qrDataUrl = await toDataURL(qrUrl);
    const qrImage = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrImage, 'base64');
    doc.image(qrBuffer, {
      fit: [180, 180],
      align: 'center',
    });
  }

  async generateTicketPdf(ticket: TicketPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFKit.default({ size: 'A4', margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on('data', (chunk: Uint8Array) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      this.addTicketToDocument(doc, ticket)
        .then(() => {
          doc.end();
        })
        .catch(reject);
    });
  }

  async generateTicketsPdf(tickets: TicketPdfData[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFKit.default({ size: 'A4', margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on('data', (chunk: Uint8Array) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const addTicketsSequentially = async () => {
        for (let i = 0; i < tickets.length; i++) {
          await this.addTicketToDocument(doc, tickets[i]);
          if (i < tickets.length - 1) {
            doc.addPage();
          }
        }
        doc.end();
      };

      addTicketsSequentially().catch(reject);
    });
  }
}
