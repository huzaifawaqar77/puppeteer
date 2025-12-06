# Multi-stage Dockerfile optimized for Next.js with Coolify
# Builder stage: includes dev dependencies for build
FROM node:20-alpine AS builder

WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Runtime stage: minimal image with only production dependencies
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Install curl for healthcheck and python for AI processing
RUN apk add --no-cache curl python3 py3-pip && \
    pip3 install google-generativeai pypdf --break-system-packages

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Copy scripts folder (ensure it exists in source)
COPY scripts ./scripts

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check - simple and reliable
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start Next.js using npm start
CMD ["npm", "start"]



