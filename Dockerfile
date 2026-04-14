# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Verify TypeScript and run tests
RUN npm run typecheck && npm run test:ci

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install a lightweight HTTP server to serve static files
RUN npm install -g serve

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy built files from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose Cloud Run port
EXPOSE 8080

# Runtime env
ENV NODE_ENV=production

# Serve the built app and bind correctly for Cloud Run
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-8080}"]
