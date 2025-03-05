import * as Sentry from "@sentry/node";
import { env, isDev } from "../env";
import { BaseException } from "../app/errors/exceptions/base.exception";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { logger } from "./logger";
import { httpIntegration } from "@sentry/node";
import { isAppSelfHosted } from "./self-host";

export const initSentry = () => {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    enabled: !isAppSelfHosted() && !isDev,
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === "console") {
        return null;
      }

      return breadcrumb;
    },
    integrations: [httpIntegration(), nodeProfilingIntegration()],
    tracesSampleRate: 1,
    profilesSampleRate: 1,
  });
};

export const captureException = (
  exception: Error,
  captureContext?: Sentry.EventHint["captureContext"]
): string => {
  logger.error(exception.message, exception);

  if (exception instanceof BaseException) {
    return Sentry.captureException(exception, {
      level: exception.severity,
      extra: exception.extra,
      ...captureContext,
    });
  }

  return Sentry.captureException(exception, captureContext);
};

export const setSentryUser = Sentry.setUser;
export const addBreadcrumb = Sentry.addBreadcrumb;
export type ExceptionSeverity = Sentry.SeverityLevel;

export const setupExpressErrorHandler = Sentry.setupExpressErrorHandler;
