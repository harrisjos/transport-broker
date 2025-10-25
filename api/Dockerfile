# Multi-stage build for Fastify API
FROM node:18-alpine AS base

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS dev-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force

# Build stage (if needed for any build steps)
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=fastify:nodejs . .

USER fastify

EXPOSE 3001

ENV PORT 3001
ENV HOST "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Run the application
CMD ["npm", "start"]