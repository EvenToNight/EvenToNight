import { z } from "zod";

export const FollowSeedSchema = z.object({
    follower: z.string(),
    followed: z.string(),
});

export type FollowSeedInput = z.infer<typeof FollowSeedSchema>;