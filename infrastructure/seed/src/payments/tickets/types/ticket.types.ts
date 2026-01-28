import { ObjectId } from "mongodb";

export interface TicketToCreate {
    eventId: string;
    userId: string;
    attendeeName: string;
    price: Object;
    ticketTypeId: string;
}

export type SeedTicket = TicketToCreate & {
    _id: ObjectId;
    purchaseDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface TicketSeedResult {
    tickets: SeedTicket[];
}