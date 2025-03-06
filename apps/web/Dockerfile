FROM node:20-bullseye AS base

FROM base AS builder
WORKDIR /app
RUN npm i -g turbo@2.4.4
COPY . .
RUN npx turbo prune web --docker

FROM base AS installer
WORKDIR /app

# Won't build without copying eslint
COPY .eslintrc.js /app/
COPY ./apps/web/nginx.conf /app/apps/web/nginx.conf
COPY --from=builder /app/out/json/ .
RUN npm install
COPY --from=builder /app/out/full/ .
RUN npm run build

FROM nginx:alpine
WORKDIR /app
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html
COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
