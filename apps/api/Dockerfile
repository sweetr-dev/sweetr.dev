FROM node:24-bookworm-slim AS base

FROM base AS builder
WORKDIR /app
RUN npm i -g turbo@2.4.4 
COPY . .
RUN npx turbo prune api --docker

FROM base AS installer
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential python3 --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/out/json/ .
RUN npm install
COPY --from=builder /app/out/full/ .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 apiuser
RUN adduser --system --uid 1001 apiuser
USER apiuser

COPY --from=installer /app .

CMD sh -c 'if [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ]; then DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DATABASE_URL#*@}" npm run prisma:migrate:production --workspace api; fi && npm run start'