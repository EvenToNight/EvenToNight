import { z } from "zod";

export const ConversationSeedSchema = z.object({
    member: z.string(),
    organization: z.string(),
});

export type ConversationSeedInput = z.infer<typeof ConversationSeedSchema>;