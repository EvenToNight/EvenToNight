import { ObjectId } from "mongodb";

export interface TicketTypeToCreate {
    eventId: string;
    type: string;
    price: {
        amount: number;
        currency: string;
        _id: ObjectId;
    };
    availableQuantity: number;
    soldQuantity: number;
}

export interface EventPrice {
    eventId: string;
    ticketTypeId: string;
    price: number;
}

export type SeedTicketType = TicketTypeToCreate & {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

export interface TicketTypeSeedResult {
    ticketTypes: SeedTicketType[];
}