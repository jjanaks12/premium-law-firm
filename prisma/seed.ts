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
      permissions: {
        "pages:list": true,
        "pages:read": true,
        "roles:list": true,
        "roles:read": true,
        "users:list": true,
        "users:read": true,
        "pages:create": true,
        "pages:delete": true,
        "pages:update": true,
        "roles:create": true,
        "roles:delete": false,
        "roles:update": true,
        "users:create": true,
        "users:delete": true,
        "users:update": true,
        "settings:list": true,
        "settings:read": false,
        "dashboard:list": true,
        "dashboard:read": false,
        "resources:list": true,
        "resources:read": false,
        "settings:update": false,
        "dashboard:update": false,
        "resources:create": false,
        "resources:delete": false,
        "resources:update": false
      },
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

  // 3. Create Court Levels
  const courtLevels = [
    { name: 'Supreme Court', nepaliName: 'सर्वोच्च अदालत' },
    { name: 'High Court', nepaliName: 'उच्च अदालत' },
    { name: 'District Court', nepaliName: 'जिल्ला अदालत' },
    { name: 'Special Court', nepaliName: 'विशेष अदालत' },
  ];
  for (const level of courtLevels) {
    await prisma.courtLevel.upsert({
      where: { name: level.name },
      update: { nepaliName: level.nepaliName },
      create: level,
    });
  }
  console.log('✅ Created/verified court levels');

  // 4. Create Party Roles
  const partyRoles = [
    { name: 'Plaintiff', nepaliName: 'वादी' },
    { name: 'Defendant', nepaliName: 'प्रतिवादी' },
    { name: 'Petitioner', nepaliName: 'निवेदक' },
    { name: 'Respondent', nepaliName: 'विपक्षी' },
    { name: 'Appellant', nepaliName: 'पुनरावेदक' },
    { name: 'Waris', nepaliName: 'वारेस' },
  ];
  for (const role of partyRoles) {
    await prisma.partyRole.upsert({
      where: { name: role.name },
      update: { nepaliName: role.nepaliName },
      create: role,
    });
  }
  console.log('✅ Created/verified party roles');

  // 5. Create Case Natures
  const caseNatures = [
    { name: 'Civil', nepaliName: 'देवानी' },
    { name: 'Criminal', nepaliName: 'फौजदारी' },
    { name: 'Writ', nepaliName: 'रिट' },
    { name: 'Commercial', nepaliName: 'वाणिज्य' },
  ];
  for (const nature of caseNatures) {
    await prisma.caseNature.upsert({
      where: { name: nature.name },
      update: { nepaliName: nature.nepaliName },
      create: nature,
    });
  }
  console.log('✅ Created/verified case natures');

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
