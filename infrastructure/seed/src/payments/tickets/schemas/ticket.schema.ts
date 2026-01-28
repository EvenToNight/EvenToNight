import { z } from "zod";

export const TicketSeedSchema = z.object({
    event: z.string(),
    user: z.string(),
    attendeeName: z.string(),
    ticketType: z.string(),
})

export type TicketSeedInput = z.infer<typeof TicketSeedSchema>;