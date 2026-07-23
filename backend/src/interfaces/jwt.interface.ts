import { UserType } from "../modules/auth/types/index.js";

export interface IJwtPayload {
  id: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

export interface IRefreshTokenPayload {
  id: string;
}
