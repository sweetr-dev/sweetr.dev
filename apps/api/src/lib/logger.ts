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

export const logger = {
  info: (msg: string, obj?: object) => {
    const cleanObj = { ...(obj || {}) };

    for (const key of Object.keys(cleanObj)) {
      if (loggableFields[key]) {
        cleanObj[key] = pick(cleanObj[key], loggableFields[key]);
      }
    }

    pinoLogger.info(cleanObj, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "info",
      data: obj,
    });
  },
  warn: (msg: string, obj?: object) => {
    pinoLogger.warn(obj || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "warning",
      data: obj,
    });
  },
  error: (msg: string, obj?: object) => {
    pinoLogger.error(obj || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "error",
      data: obj,
    });
  },
  debug: (msg: string, obj?: object) => {
    pinoLogger.debug(obj || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "debug",
      data: obj,
    });
  },
  trace: (msg: string, obj?: object) => {
    pinoLogger.trace(obj || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "debug",
      data: obj,
    });
  },
  fatal: (msg: string, obj?: object) => {
    pinoLogger.fatal(obj || {}, msg);
    addBreadcrumb({
      message: msg,
      category: "log",
      level: "fatal",
      data: obj,
    });
  },
};
