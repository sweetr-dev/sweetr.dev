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
  .use(cors({ origin: env.FRONTEND_URL, credentials: true, methods: ["*"] }));

// Route handlers
expressApp.use(githubRouter);
expressApp.use(stripeRouter);
expressApp.use(slackRouter);
expressApp.use(bullBoardRouter);

expressApp.use(yoga); // Leave Yoga last

// Error handler.
setupExpressErrorHandler(expressApp);
expressApp.use(errorHandler);
