import { z } from "zod";

export const ParticipationSeedSchema = z.object({
    event: z.string(),
    user: z.string(),
});

export type ParticipationSeedInput = z.infer<typeof ParticipationSeedSchema>;