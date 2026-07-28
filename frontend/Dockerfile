# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Copy root and workspace package files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/validations/package.json ./packages/validations/
COPY prisma ./prisma

# Install dependencies (ignoring MacOS lockfile to ensure Linux native bindings like SWC and Parcel are fetched)
RUN rm package-lock.json && npm install

# ─── Stage 2: Builder ──────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build validations package first (required by frontend)
RUN npm run build --workspace=@app/validations

# Build frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=frontend

# ─── Stage 3: Production Runner ──────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
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
