FROM node:24-bookworm-slim AS base

FROM base AS builder
WORKDIR /app
RUN npm i -g turbo@2.4.4
COPY . .
RUN npx turbo prune web --docker

FROM base AS installer
ARG TARGETARCH
WORKDIR /app

# Won't build without copying eslint
COPY .eslintrc.js /app/
COPY ./apps/web/nginx.conf /app/apps/web/nginx.conf
COPY --from=builder /app/out/json/ .
RUN npm install --include=optional \
    && case "$TARGETARCH" in \
        amd64) npm install --no-save @rollup/rollup-linux-x64-gnu ;; \
        arm64) npm install --no-save @rollup/rollup-linux-arm64-gnu ;; \
    esac
COPY --from=builder /app/out/full/ .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache jq
WORKDIR /app
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html
COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./apps/web/docker-entrypoint.sh /docker-entrypoint.d/00-env-config.sh
RUN chmod +x /docker-entrypoint.d/00-env-config.sh

EXPOSE 80
