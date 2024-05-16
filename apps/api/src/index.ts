import { resolve } from "path";
import { createServer } from "node:http";
import { createServer as createSslServer } from "node:https";
import { readFileSync } from "fs";
import { apiUrl, env } from "./env";
import { expressApp } from "./express";
import { initBullMQ } from "./bull-mq/init-bull-mq";
import { captureException } from "./lib/sentry";

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

process.on("unhandledRejection", (reason) => {
  captureException(reason as Error);
});
