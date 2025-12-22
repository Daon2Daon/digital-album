# Dockerfile for Digital Album
# Optimized for Synology NAS deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY server.js ./
COPY prisma ./prisma/
COPY public ./public/
COPY package*.json ./
COPY entrypoint.sh ./

# Create uploads and prisma directories and set permissions
RUN mkdir -p public/uploads prisma && \
    chmod +x entrypoint.sh && \
    chown -R node:node /app

# Use non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8754/api/viewer/images', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 8754

# Start application with dumb-init and entrypoint script
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "entrypoint.sh"]
