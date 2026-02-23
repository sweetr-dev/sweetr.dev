import { resolve } from "path";
import { readFileSync } from "fs";
import { apiUrl, env } from "./env";
import { buildApp } from "./fastify";
import { initBullMQ } from "./bull-mq/init-bull-mq";
import { captureException, initSentry } from "./lib/sentry";
import { UnknownException } from "./app/errors/exceptions/unknown.exception";
import { closeAllQueueWorkers } from "./bull-mq/workers";

initSentry();

const start = async () => {
  console.log(resolve(__dirname, "../../../certs/tls.key"));
  const httpsOptions = env.USE_SELF_SIGNED_SSL
    ? {
        key: readFileSync(resolve(__dirname, "../../../certs/tls.key")),
        cert: readFileSync(resolve(__dirname, "../../../certs/tls.cert")),
      }
    : undefined;

  const app = await buildApp({
    ...(httpsOptions ? { https: httpsOptions } : {}),
    bodyLimit: 50 * 1024 * 1024,
    trustProxy: true,
  });

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  await initBullMQ();

  console.info(`🍧 API is running on ${apiUrl}`);

  const shutdownGracefully = async (signal: string) => {
    console.log(`🔶 Received ${signal}, closing server..`);
    await closeAllQueueWorkers();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdownGracefully("SIGINT"));
  process.on("SIGTERM", () => shutdownGracefully("SIGTERM"));
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

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
