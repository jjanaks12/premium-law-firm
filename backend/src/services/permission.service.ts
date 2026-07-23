import redis from "../config/redis.js";
import { prisma } from "../lib/prisma.js";

export interface UserPermissions {
  roleId: number;
  permissions: Record<string, string[]>;
  isActive: boolean;
  coreUser: boolean;
}

const USER_PERMISSIONS_PREFIX = "user:permissions:";
const USER_PERMISSIONS_TTL = 3600;

export const getUserPermissions = async (userId: number): Promise<UserPermissions | null> => {
  const cacheKey = `${USER_PERMISSIONS_PREFIX}${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as UserPermissions;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      deletedAt: true,
      roleId: true,
      role: { select: { permissions: true, isActive: true, coreUser: true } },
    },
  });

  if (!user || user.deletedAt || !user.role) return null;

  const data: UserPermissions = {
    roleId: user.roleId,
    permissions: (user.role.permissions as Record<string, string[]>) || {},
    isActive: user.role.isActive,
    coreUser: user.role.coreUser,
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", USER_PERMISSIONS_TTL);
  return data;
};

export const invalidateUserPermissions = async (userId: number): Promise<void> => {
  await redis.del(`${USER_PERMISSIONS_PREFIX}${userId}`);
};

export const invalidateRoleForAllUsers = async (roleId: number): Promise<void> => {
  const users = await prisma.user.findMany({ where: { roleId }, select: { id: true } });
  if (users.length === 0) return;
  const pipeline = redis.pipeline();
  for (const u of users) pipeline.del(`${USER_PERMISSIONS_PREFIX}${u.id}`);
  await pipeline.exec();
};
