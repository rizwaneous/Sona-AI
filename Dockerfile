# Sona AI - Autonomous Multi-Agent Agricultural Intelligence Platform
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies and utilities
RUN apk add --no-cache curl wget python3 make g++

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy project source code
COPY . .

# Expose server port
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/healthz || exit 1

# Start the application
CMD ["npm", "start"]
