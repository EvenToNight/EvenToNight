
export interface OrderToCreate {
    userId: string;
    eventId: string;
    ticketIds: string[];
}

export type SeedOrder = OrderToCreate & {
    _id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface OrderSeedResult {
    orders: SeedOrder[];
}