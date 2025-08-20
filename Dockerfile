# Stage 1: Build
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package and install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY .env* ./
RUN npm install

# Copy source code
COPY . .

# Build project
RUN npm run build

# Stage 2: Run
FROM node:18

WORKDIR /app

# Copy only dist folder & package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose port
EXPOSE 4000

# Default command
CMD ["node", "dist/index.js"]
