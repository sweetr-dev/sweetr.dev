import * as Sentry from "@sentry/react";
import { useWorkspace } from "./workspace.provider";
import { useAuthenticatedUser } from "./auth.provider";
import { getEnv } from "../env";

export const initSentry = () => {
  const dsn = getEnv("SENTRY_DSN");

  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: getEnv("APP_ENV"),
    enabled: getEnv("APP_ENV") !== "development",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/api\.sweetr\.local/,
      /^https:\/\/api\.sweetr\.dev/,
      getEnv("API_ENDPOINT"),
    ].filter(Boolean),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
};

export const useSentry = () => {
  const { workspace } = useWorkspace();
  const { user } = useAuthenticatedUser();

  Sentry.setUser({
    Workspace: workspace.handle,
    id: user.id,
    email: user.email || "",
    username: user.handle,
  });
};
