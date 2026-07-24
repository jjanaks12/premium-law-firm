/**
 * collect-schemas.mjs
 *
 * Scans backend/src/modules for all *.prisma files and copies them
 * into prisma/schema/ so Prisma can pick them up alongside base.prisma.
 *
 * Usage: node scripts/collect-schemas.mjs
 * Called automatically by `npm run db:generate` and `npm run db:migrate`.
 */

import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const MODULES_DIR = join(ROOT, 'backend', 'src', 'modules');
const SCHEMA_DIR = join(ROOT, 'prisma', 'schema');

async function collectFromDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFromDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.prisma')) {
      const dest = join(SCHEMA_DIR, basename(entry.name));
      await copyFile(fullPath, dest);
      const rel = fullPath.replace(ROOT + '/', '');
      console.log(`  ✔ Collected: ${rel} → prisma/schema/${basename(entry.name)}`);
    }
  }
}

console.log('🔍 Collecting module Prisma schemas...');
await mkdir(SCHEMA_DIR, { recursive: true });
await collectFromDir(MODULES_DIR);
console.log('✅ Done. Running prisma generate...\n');
