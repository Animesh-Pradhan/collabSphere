import { z } from "zod";

export const documentContentSchema = z.object({
    version: z.literal(1),
    blocks: z.array(z.unknown()),
});

export type DocumentContentSchema = z.infer<typeof documentContentSchema>;