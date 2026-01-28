import { z } from "zod";
import { ObjectId } from "mongodb";

export const TicketTypeSeedSchema = z.object({
    event: z.string(),
    type: z.string(),
    price: z.object({
        amount: z.number(),
        currency: z.string(),
        _id: z.instanceof(ObjectId),
    }),
    availableQuantity: z.number(),
    soldQuantity: z.number(),
})

export type TicketTypeSeedInput = z.infer<typeof TicketTypeSeedSchema>;