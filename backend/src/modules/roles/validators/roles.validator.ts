import { z } from "zod";

const permissionsSchema = z.record(z.string(), z.array(z.string()));

export const createRoleODT = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  coreUser: z.boolean().optional(),
  isActive: z.boolean().optional(),
  permissions: permissionsSchema.optional(),
});

export const updateRoleODT = createRoleODT.partial();
