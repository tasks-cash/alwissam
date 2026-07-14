# Build from repo root: docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY pnpm-workspace.yaml package.json ./
COPY packages/shared-config/package.json packages/shared-config/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-validation/package.json packages/shared-validation/
COPY packages/shared-utils/package.json packages/shared-utils/
COPY apps/api/package.json apps/api/
RUN pnpm install --filter @alwisam/api... --frozen-lockfile=false

FROM deps AS build
COPY packages/shared-config packages/shared-config
COPY packages/shared-types packages/shared-types
COPY packages/shared-validation packages/shared-validation
COPY packages/shared-utils packages/shared-utils
COPY apps/api apps/api
RUN pnpm --filter @alwisam/shared-config build \
  && pnpm --filter @alwisam/shared-types build \
  && pnpm --filter @alwisam/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S alwisam && adduser -S alwisam -G alwisam
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
# Workspace linked packages may resolve via node_modules; copy built shared dirs too
COPY --from=build /app/packages ./packages
USER alwisam
EXPOSE 4000
CMD ["node", "dist/main.js"]
