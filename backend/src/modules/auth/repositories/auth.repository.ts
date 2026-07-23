import { prisma } from "../../../lib/prisma.js";
import type { DeviceInfo, UserType } from "../types/index.js";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findUserById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async findUserWithRoleById(id: number) {
    return prisma.user.findUnique({ where: { id }, include: { role: true } });
  }

  static async createUser(data: {
    email: string;
    hashedPassword: string;
    roleId: number;
    userType: UserType;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.hashedPassword,
        roleId: data.roleId,
        userType: data.userType,
      },
      select: { id: true, email: true, role: true, userType: true },
    });
  }

  static async findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  }

  static async getRoles() {
    return prisma.role.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, description: true },
    });
  }

  static async updateUserPassword(email: string, hashedPassword: string) {
    return prisma.user.update({ where: { email }, data: { password: hashedPassword } });
  }

  // ─── Refresh Tokens ─────────────────────────────────────────────────────────

  static async createRefreshToken(
    token: string,
    userId: number,
    expiresAt: Date,
    deviceInfo?: DeviceInfo,
  ) {
    return prisma.refreshToken.create({
      data: {
        token, userId, expiresAt,
        ipAddress: deviceInfo?.ipAddress,
        userAgent: deviceInfo?.userAgent,
        browser: deviceInfo?.browser,
        os: deviceInfo?.os,
        device: deviceInfo?.device ?? "desktop",
      },
    });
  }

  static async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  static async deleteRefreshToken(token: string) {
    const existing = await prisma.refreshToken.findUnique({ where: { token } });
    if (!existing) return;
    return prisma.refreshToken.delete({ where: { token } });
  }
}
