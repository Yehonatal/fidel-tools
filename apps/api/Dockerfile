FROM node:20-alpine AS base

# Install pnpm
RUN npm i -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/core-native/package.json ./packages/core-native/
COPY packages/lang-am/package.json ./packages/lang-am/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=dependencies /app/packages/core-native/node_modules ./packages/core-native/node_modules
COPY --from=dependencies /app/packages/lang-am/node_modules ./packages/lang-am/node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @fidel-tools/core build
RUN pnpm --filter @fidel-tools/lang-am build
RUN pnpm --filter @fidel-tools/api build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
COPY --from=builder /app/packages/lang-am/dist ./packages/lang-am/dist
COPY --from=builder /app/packages/lang-am/package.json ./packages/lang-am/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=builder /app/packages/core-native/node_modules ./packages/core-native/node_modules
COPY --from=builder /app/packages/lang-am/node_modules ./packages/lang-am/node_modules
COPY --from=builder /app/packages/core-native/dist ./packages/core-native/dist
COPY --from=builder /app/packages/core-native/package.json ./packages/core-native/package.json

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
