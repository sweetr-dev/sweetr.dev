declare global {
  interface Window {
    __SWEETR_ENV__?: Record<string, string>;
  }
}

const ENV_MAP = {
  API_ENDPOINT: "VITE_API_ENDPOINT",
  AUTH_COOKIE_DOMAIN: "VITE_AUTH_COOKIE_DOMAIN",
  GITHUB_APP: "VITE_GITHUB_APP",
  SENTRY_DSN: "VITE_SENTRY_DSN",
  APP_ENV: "VITE_ENV",
} as const;

export type EnvKey = keyof typeof ENV_MAP;

export function getEnv(key: EnvKey): string {
  return (
    window.__SWEETR_ENV__?.[key] ??
    (import.meta as any).env[ENV_MAP[key]] ??
    ""
  );
}
