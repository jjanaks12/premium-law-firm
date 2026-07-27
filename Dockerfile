# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/validations/package.json ./packages/validations/
COPY prisma ./prisma

# Install dependencies (including devDependencies for building/running tsx)
RUN npm ci

# ─── Stage 2: Production Runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and project source files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Collect schemas and generate Prisma client
RUN npm run db:generate

EXPOSE 4000

# Run the backend using tsx to support TypeScript workspace resolution in production
CMD ["npx", "tsx", "--tsconfig", "backend/tsconfig.json", "backend/src/index.ts"]
