/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_API: string;
  readonly VITE_AUTH_COOKIE_DOMAIN: string;
  readonly VITE_GITHUB_APP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
