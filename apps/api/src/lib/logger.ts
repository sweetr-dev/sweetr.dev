import pino from "pino";
import { env } from "../env";
import { addBreadcrumb } from "@sentry/node";
import { pick } from "radash";

const logTailStream = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: env.LOGTAIL_TOKEN },
});
const consoleStream = pino.destination();

const stream = env.LOG_DRAIN === "logtail" ? logTailStream : consoleStream;

const pinoLogger = pino(
  {
    nestedKey: "payload",
    level: env.LOG_LEVEL,
  },
  stream
);

const loggableFields = {
  workspace: ["id", "name", "handle", "createdAt", "updatedAt"],
  pullRequest: ["id", "title", "number", "createdAt", "updatedAt"],
};

const sanitize = (payload?: object) => {
  const sanitizedPayload = { ...(payload || {}) };

  for (const key of Object.keys(sanitizedPayload)) {
    if (
      loggableFields[key] &&
      typeof sanitizedPayload[key] === "object" &&
      sanitizedPayload[key] !== null
    ) {
      sanitizedPayload[key] = pick(sanitizedPayload[key], loggableFields[key]);
    }
  }

  return sanitizedPayload;
};

export const logger = {
  info: (msg: string, payload?: object) => {
    const sanitizedPayload = sanitize(payload);

    pinoLogger.info(sanitizedPayload, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "info",
      data: payload,
    });
  },
  warn: (msg: string, payload?: object) => {
    pinoLogger.warn(payload || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "warning",
      data: payload,
    });
  },
  error: (msg: string, payload?: object) => {
    pinoLogger.error(payload || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "error",
      data: payload,
    });
  },
  debug: (msg: string, payload?: object) => {
    const cleanObj = sanitize(payload);

    pinoLogger.debug(cleanObj || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "debug",
      data: payload,
    });
  },
  trace: (msg: string, payload?: object) => {
    pinoLogger.trace(payload || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "debug",
      data: payload,
    });
  },
  fatal: (msg: string, payload?: object) => {
    pinoLogger.fatal(payload || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "fatal",
      data: payload,
    });
  },
};
