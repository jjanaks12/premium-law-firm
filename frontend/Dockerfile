# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/validations/package.json ./packages/validations/
COPY packages/types/package.json ./packages/types/
COPY prisma ./prisma

# Install dependencies (ignoring MacOS lockfile to ensure Linux native bindings like SWC and Parcel are fetched)
RUN rm package-lock.json && npm install

# ─── Stage 2: Builder ──────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_module[s] ./frontend/node_modules/
COPY --from=deps /app/backend/node_module[s] ./backend/node_modules/
COPY --from=deps /app/packages/validations/node_module[s] ./packages/validations/node_modules/
COPY --from=deps /app/packages/types/node_module[s] ./packages/types/node_modules/

# Generate Prisma client for types
RUN npm run db:generate

# Build validations package first (required by frontend)
RUN npm run build --workspace=@app/types
RUN npm run build --workspace=@app/validations

# Build frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=frontend

# ─── Stage 3: Production Runner ──────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output from Next.js
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server (Next.js standalone mode generates server.js inside the app dir structure)
CMD ["node", "frontend/server.js"]
