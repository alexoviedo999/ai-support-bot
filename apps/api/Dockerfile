FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy API package
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy API source
COPY apps/api ./apps/api

# Build
WORKDIR /app/apps/api
RUN pnpm build

# Expose port
EXPOSE 3001

# Start
CMD ["pnpm", "start"]
