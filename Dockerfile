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

# Expose port (Cloud Run default)
EXPOSE 8080

# Cloud Run requires PORT environment variable (default to 8080)
ENV PORT=8080 NODE_ENV=production

# Health check (uses PORT env var dynamically)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 8080; require('http').get('http://localhost:' + port, (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Serve the built app - uses PORT environment variable
# Use sh -c to expand environment variables
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
