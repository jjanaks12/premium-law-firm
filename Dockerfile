# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/validations/package.json ./packages/validations/
COPY packages/types/package.json ./packages/types/
COPY prisma ./prisma

# Install dependencies (including devDependencies for building/running tsx)
RUN npm ci

# ─── Stage 2: Production Runner ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules and project source files
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_module[s] ./backend/node_modules/
COPY --from=deps /app/packages/validations/node_module[s] ./packages/validations/node_modules/
COPY --from=deps /app/packages/types/node_module[s] ./packages/types/node_modules/

# Collect schemas and generate Prisma client
RUN npm run db:generate

# Build workspace packages (types, validations)
RUN npm run build --workspace=@app/types
RUN npm run build --workspace=@app/validations

EXPOSE 4000

# Run the backend using tsx to support TypeScript workspace resolution in production
CMD ["npx", "tsx", "--tsconfig", "backend/tsconfig.json", "backend/src/index.ts"]
