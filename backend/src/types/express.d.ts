import { User, Role } from "@prisma/generated";

declare global {
  namespace Express {
    interface Request {
      auth_user?: Omit<User, "password"> & {
        role?: Role | null;
      };
    }
  }
}
