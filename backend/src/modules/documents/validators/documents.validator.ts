import { z } from "zod";

export const uploadMetadataODT = z.object({
  tag: z.string().max(50).optional(),
  description: z.string().max(255).optional(),
});
