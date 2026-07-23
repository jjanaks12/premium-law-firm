export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: number; email: string; userType: UserType };
}

export type DeviceInfo = {
  userAgent?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  device?: string;
};

export const UserType = { PERSONAL: "PERSONAL", ORGANIZATION: "ORGANIZATION" } as const;
export type UserType = (typeof UserType)[keyof typeof UserType];

export interface OtpSession { userId: number; email: string; otp: string; }
export interface ResetSession { userId: number; email: string; }
