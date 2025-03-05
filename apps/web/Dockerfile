FROM node:20-bullseye AS base

FROM base AS builder
WORKDIR /app
RUN npm i -g turbo 
RUN npm i -g eslint 
COPY . .
RUN npx turbo prune web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# Copy ESLint configuration files
COPY .eslintrc.js /app/
COPY ./apps/web/nginx.conf /app/apps/web/nginx.conf

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
RUN npm run build

# Use a lightweight web server to serve the built app
FROM nginx:alpine
WORKDIR /app

# Copy the built app from the previous stage
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
