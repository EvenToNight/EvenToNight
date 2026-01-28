import { ObjectId } from "mongodb";

export interface TicketToCreate {
    eventId: string;
    userId: string;
    attendeeName: string;
    ticketType: string;
}

export type SeedTicket = TicketToCreate & {
    _id: ObjectId;
    purchasedDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface TicketSeedResult {
    tickets: SeedTicket[];
}