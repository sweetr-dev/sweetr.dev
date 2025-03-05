FROM node:20-bullseye AS base

FROM base AS builder
WORKDIR /app
RUN npm i -g turbo 
COPY . .
RUN npx turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

RUN npm run build

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 apiuser
RUN adduser --system --uid 1001 apiuser
USER apiuser
COPY --from=installer /app .

CMD npm run prisma:migrate:production --workspace api && npm run start