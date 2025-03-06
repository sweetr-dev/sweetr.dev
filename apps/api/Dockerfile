FROM node:20-bullseye AS base

FROM base AS builder
WORKDIR /app
RUN npm i -g turbo@2.4.4 
COPY . .
RUN npx turbo prune api --docker

FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN npm install
COPY --from=builder /app/out/full/ .
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 apiuser
RUN adduser --system --uid 1001 apiuser
USER apiuser

COPY --from=installer /app .

CMD npm run prisma:migrate:production --workspace api && npm run start