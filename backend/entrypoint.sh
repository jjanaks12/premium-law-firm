#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npx tsx src/seeding/seed.ts
  echo "Seeding complete."
fi

echo "Starting server..."
exec npm start
