import { UserType } from "../modules/auth/types/index.ts";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        userType: UserType;
      };
    }
  }
}
