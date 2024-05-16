import * as Sentry from "@sentry/node";
import { env, isLive } from "../env";
import { Hub } from "@sentry/node";
import { ScopeContext } from "@sentry/types";
import { BaseException } from "../app/errors/exceptions/base.exception";
import { expressApp } from "../express";
import { logger } from "./logger";

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.APP_ENV,
  enabled: isLive,
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "console") {
      return null;
    }

    return breadcrumb;
  },
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({
      app: expressApp,
    }),
  ],
  normalizeDepth: 11,
});

export const captureException = (
  exception: Error,
  captureContext?: Partial<ScopeContext>
): ReturnType<Hub["captureException"]> => {
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
