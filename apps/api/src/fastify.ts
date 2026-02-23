import Fastify, { FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import rawBody from "fastify-raw-body";
import formbody from "@fastify/formbody";
import { yoga } from "./yoga";
import { githubRouter } from "./app/github/github.router";
import { errorHandler } from "./lib/fastify-helpers";
import { bullBoardRouter } from "./bull-mq/bull-board.router";
import { setupFastifyErrorHandler } from "./lib/sentry";
import { stripeRouter } from "./app/billing/stripe.router";
import { slackRouter } from "./app/integrations/slack/slack.router";
import { env } from "./env";
import { deploymentsRouter } from "./app/deployment/deployments.router";
import { healthRouter } from "./app/health/health.router";
import { isAppSelfHosted } from "./lib/self-host";

export async function buildApp(opts: FastifyServerOptions = {}) {
  const app = Fastify(opts);

  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  });

  await app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });

  await app.register(formbody);

  // Allow Fastify to forward multipart requests to GraphQL Yoga
  app.addContentTypeParser("multipart/form-data", {}, (_req, _payload, done) =>
    done(null)
  );

  await app.register(healthRouter);
  await app.register(githubRouter);

  if (!isAppSelfHosted()) {
    await app.register(stripeRouter);
  }

  await app.register(slackRouter);
  await app.register(bullBoardRouter);
  await app.register(deploymentsRouter);

  app.route({
    url: yoga.graphqlEndpoint,
    method: ["GET", "POST", "OPTIONS"],
    handler: (req, reply) =>
      yoga.handleNodeRequestAndResponse(req, reply, {
        req,
        reply,
      } as never),
  });

  setupFastifyErrorHandler(app);
  app.setErrorHandler(errorHandler);

  return app;
}
