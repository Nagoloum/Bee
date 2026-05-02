# ─── Builder ───────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root manifests + workspaces
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages

# Install ALL workspaces (Prisma needs root node_modules)
RUN npm ci

# Generate Prisma client + build
RUN npm run prisma:generate -w @bee/api
RUN npm run build -w @bee/api

# ─── Runner ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main.js"]
