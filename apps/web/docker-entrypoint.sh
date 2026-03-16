#!/bin/sh
json_val() { jq -n --arg v "$1" '$v'; }

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__SWEETR_ENV__ = {
  API_ENDPOINT: $(json_val "${API_ENDPOINT:-}"),
  AUTH_COOKIE_DOMAIN: $(json_val "${AUTH_COOKIE_DOMAIN:-}"),
  GITHUB_APP: $(json_val "${GITHUB_APP:-}"),
  SENTRY_DSN: $(json_val "${SENTRY_DSN:-}"),
  APP_ENV: $(json_val "${APP_ENV:-production}"),
};
EOF
