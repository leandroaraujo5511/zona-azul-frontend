# Zona Azul Frontend - Dockerfile para Produção
# Multi-stage build para otimizar tamanho da imagem

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (produção)
RUN npm ci --only=production --ignore-scripts && \
    npm ci --only=development --ignore-scripts

# Copy source code
COPY . .

# Build application for production
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:3000/api/v1}

RUN npm run build:prod

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.0

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/serve.json ./serve.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5173', (r) => {if (r.statusCode === 200) process.exit(0); process.exit(1);})"

# Start server
CMD ["serve", "-s", "dist", "-l", "5173", "-c", "serve.json"]





