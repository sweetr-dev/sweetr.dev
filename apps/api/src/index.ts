import { resolve } from "path";
import { createServer } from "node:http";
import { createServer as createSslServer } from "node:https";
import { readFileSync } from "fs";
import { apiUrl, env } from "./env";
import { expressApp } from "./express";
import { initBullMQ } from "./bull-mq/init-bull-mq";
import { captureException } from "./lib/sentry";
import { UnknownException } from "./app/errors/exceptions/unknown.exception";
import { closeAllQueueWorkers } from "./bull-mq/workers";

const server = env.USE_SSL
  ? createSslServer(
      {
        key: readFileSync(resolve(__dirname, "../../../certs/tls.key")),
        cert: readFileSync(resolve(__dirname, "../../../certs/tls.cert")),
      },
      expressApp
    )
  : createServer(expressApp);

server.listen(env.PORT, async () => {
  await initBullMQ();

  console.info(`🍧 API is running on ${apiUrl}`);

  return;
});

const shutdownGracefully = async (signal) => {
  console.log(`🔶 Received ${signal}, closing server..`);

  await closeAllQueueWorkers();
  process.exit(0);
};

process.on("SIGINT", () => shutdownGracefully("SIGINT"));
process.on("SIGTERM", () => shutdownGracefully("SIGTERM"));

process.on("uncaughtException", function (error: Error, origin) {
  captureException(
    new UnknownException("Uncaught Exception", {
      originalError: error,
      extra: {
        origin,
      },
    })
  );
});

process.on("unhandledRejection", (error: Error, promise) => {
  captureException(
    new UnknownException("Unhandled Promise Rejection", {
      originalError: error,
      extra: {
        promise,
      },
    })
  );
});
