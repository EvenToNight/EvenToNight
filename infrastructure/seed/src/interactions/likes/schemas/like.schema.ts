import { z } from "zod";

export const LikeSeedSchema = z.object({
    event: z.string(),
    user: z.string(),
});

export type LikeSeedInput = z.infer<typeof LikeSeedSchema>;