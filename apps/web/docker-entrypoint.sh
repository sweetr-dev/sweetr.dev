#!/bin/sh
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__SWEETR_ENV__ = {
  API_ENDPOINT: "${API_ENDPOINT:-}",
  AUTH_COOKIE_DOMAIN: "${AUTH_COOKIE_DOMAIN:-}",
  GITHUB_APP: "${GITHUB_APP:-}",
  SENTRY_DSN: "${SENTRY_DSN:-}",
  APP_ENV: "${APP_ENV:-production}",
};
EOF
exec nginx -g 'daemon off;'
