# ==========================================
# Multi-stage Dockerfile for ProjectFlow Backend
# ==========================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL (required by Prisma engine on Alpine)
RUN apk add --no-cache openssl

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src/

# Generate Prisma client and compile TypeScript to JavaScript
RUN npx prisma generate
RUN npx tsc

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=4000

# Install production-only dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

# Copy compiled code and generated Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Uploads directory volume
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "dist/server.js"]
