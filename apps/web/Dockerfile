# Build from repo root: docker build -f apps/web/Dockerfile .
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
RUN pnpm install --filter @alwisam/web... --frozen-lockfile=false

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:4001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY apps/web apps/web
RUN pnpm --filter @alwisam/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
RUN addgroup -S alwisam && adduser -S alwisam -G alwisam
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/apps/web/next.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/public ./public
USER alwisam
EXPOSE 3001
CMD ["npx", "next", "start", "-p", "3001"]
