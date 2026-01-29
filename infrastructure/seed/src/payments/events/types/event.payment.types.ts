
export interface EventPaymentToInsert {
    _id: string;
    creatorId: string;
    title: string;
    date: string | undefined;
    status: string;
}

export type SeedEventPayment = EventPaymentToInsert & {
    createdAt: Date;
    updatedAt: Date;
};

export interface EventPaymentSeedResult {
    eventPayments: SeedEventPayment[];
}