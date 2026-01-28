import { z } from "zod";

export const ReviewSeedSchema = z.object({
    event: z.string(),
    user: z.string(),
    creator: z.string(),
    collaborators: z.array(z.string()),
    rating: z.number().min(1).max(5),
    title: z.string(),
    comment: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type ReviewSeedInput = z.infer<typeof ReviewSeedSchema>;
