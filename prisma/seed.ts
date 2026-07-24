import { PrismaClient } from './generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // To load DATABASE_URL from .env file

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'System Administrator with full access',
      permissions: {},
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      description: 'Law firm staff member',
      permissions: {},
    },
  });

  console.log('✅ Created/verified roles:', { adminRole, staffRole });

  // Pre-hashed password for 'Admin123!' (using bcrypt cost factor 10)
  const hashedPassword = '$2b$10$8jkh9zFyRSp75OpujctWKOPO7XqwdFjJMZ/Wj6t0cA9G.xOvX7BXS';

  // We set deleted_at to null if it's nullable in the future, 
  // but if it's currently required in the database, we pass a dummy value or handle it.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@premiumlaw.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@premiumlaw.com',
      first_name: 'System',
      last_name: 'Admin',
      password: hashedPassword,
      role_id: adminRole.id
    },
  });

  console.log('✅ Created/verified admin user:', adminUser);
  console.log('🌱 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
