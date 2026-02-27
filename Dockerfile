FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- Build kv-client from source ---
FROM base AS kv-client
RUN apk add --no-cache git
RUN git clone --depth=1 https://github.com/hanzoai/kv-client.git /kv-client
WORKDIR /kv-client
RUN npm install && npm run build

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Swap file: reference to local tarball
COPY --from=kv-client /kv-client /kv-client
RUN sed -i 's|file:../../hanzo/kv-client|file:/kv-client|' package.json && \
    pnpm install --no-frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SITE_NAME=Lux
ARG NEXT_PUBLIC_SITE_URL=https://lux.chat
ARG NEXT_PUBLIC_DEFAULT_MODEL=zen4-mini
ARG NEXT_PUBLIC_LUX_IAM_URL=https://lux.id
ARG NEXT_PUBLIC_LUX_IAM_CLIENT_ID=lux-chat-client-id
ARG NEXT_PUBLIC_HANZO_IAM_URL=https://hanzo.id
ARG NEXT_PUBLIC_HANZO_IAM_CLIENT_ID=hanzo-chat-client-id

ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_DEFAULT_MODEL=$NEXT_PUBLIC_DEFAULT_MODEL \
    NEXT_PUBLIC_LUX_IAM_URL=$NEXT_PUBLIC_LUX_IAM_URL \
    NEXT_PUBLIC_LUX_IAM_CLIENT_ID=$NEXT_PUBLIC_LUX_IAM_CLIENT_ID \
    NEXT_PUBLIC_HANZO_IAM_URL=$NEXT_PUBLIC_HANZO_IAM_URL \
    NEXT_PUBLIC_HANZO_IAM_CLIENT_ID=$NEXT_PUBLIC_HANZO_IAM_CLIENT_ID \
    HANZO_API_KEY=build-placeholder \
    KV_HOST=localhost

RUN pnpm build

# --- Runtime ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
