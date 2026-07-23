import { PrismaClient } from "../../generated/prisma/client.js";
import bcrypt from "bcrypt";
import { PERMISSION_CATALOG } from "../config/permissions.config.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Generate full admin permissions from catalog
  const adminPermissions: Record<string, string[]> = {};
  for (const [resource, actions] of Object.entries(PERMISSION_CATALOG)) {
    adminPermissions[resource] = actions;
  }

  // 2. Create Super Admin role
  const adminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: { permissions: adminPermissions, coreUser: true },
    create: {
      name: "Super Admin",
      description: "Has full access to the system.",
      permissions: adminPermissions,
      coreUser: true,
    },
  });

  console.log(`✅ Super Admin role ensured (ID: ${adminRole.id})`);

  // 3. Create initial super admin user
  const adminEmail = "admin@example.com";
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { roleId: adminRole.id },
    create: {
      email: adminEmail,
      password: hashedPassword,
      userType: "PERSONAL",
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Super Admin user ensured (Email: ${adminUser.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
