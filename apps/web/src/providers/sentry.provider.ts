import * as Sentry from "@sentry/react";
import { useWorkspace } from "./workspace.provider";
import { useAuthenticatedUser } from "./auth.provider";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_ENV,
    enabled: import.meta.env.VITE_ENV !== "development",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/api\.sweetr\.local/,
      /^https:\/\/api\.sweetr\.dev/,
    ],
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
