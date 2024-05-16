import pino from "pino";
import { env } from "../env";
import { addBreadcrumb } from "@sentry/node";

const logTailStream = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: env.LOGTAIL_TOKEN },
});
const consoleStream = pino.destination();

const stream = env.LOG_DRAIN === "logtail" ? logTailStream : consoleStream;

export const logger = pino(
  {
    nestedKey: "payload",
    hooks: {
      logMethod(args, method) {
        // Accept message as first argument, payload as second
        if (args.length === 2) {
          method.apply(this, [args[1], args[0]]);
        } else {
          method.apply(this, args);
        }

        // Adds log to Sentry
        addBreadcrumb({
          message: args[0],
          category: "log",
          level: "info",
          data: args[1],
        });
      },
    },
  },
  stream
);
