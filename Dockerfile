# Stage 1: Build Web App
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@9

# Copy configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/plugins/package.json ./packages/plugins/
COPY apps/web/package.json ./apps/web/
COPY apps/desktop/package.json ./apps/desktop/
COPY e2e/package.json ./e2e/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source trees
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Build production bundle
RUN pnpm --filter @forgegis/web build

# Stage 2: Minimal Alpine NGINX Runtime
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
