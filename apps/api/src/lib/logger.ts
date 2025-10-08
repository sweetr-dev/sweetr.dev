import pino from "pino";
import { env } from "../env";
import { addBreadcrumb } from "@sentry/node";

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

export const logger = {
  info: (msg: string, obj?: object) => {
    pinoLogger.info(obj || {}, msg);
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
