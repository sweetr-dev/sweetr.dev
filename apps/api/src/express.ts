import express from "express";
import { yoga } from "./yoga";
import { githubRouter } from "./app/github/github.router";
import { errorHandler } from "./lib/express-helpers";
import { bullBoardRouter } from "./bull-mq/bull-board.router";
import { setupExpressErrorHandler } from "./lib/sentry";
import { stripeRouter } from "./app/billing/stripe.router";
import { slackRouter } from "./app/integrations/slack/slack.router";
import cors from "cors";
import { env } from "./env";
import { deploymentsRouter } from "./app/deployment/deployments.router";
import { healthRouter } from "./app/health/health.router";

export const expressApp = express();

// Middlewares
expressApp
  .use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  )
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    })
  )
  .set("trust proxy", 1);

// Route handlers
expressApp.use(healthRouter);
expressApp.use(githubRouter);
expressApp.use(stripeRouter);
expressApp.use(slackRouter);
expressApp.use(bullBoardRouter);

// Customer-facing API
expressApp.use(deploymentsRouter);
expressApp.use(yoga); // Leave Yoga last

// Error handler.
setupExpressErrorHandler(expressApp);
expressApp.use(errorHandler);
