import express from "express";
import { yoga } from "./yoga";
import { githubRouter } from "./app/github/github.router";
import { errorHandler } from "./lib/express-helpers";
import { bullBoardRouter } from "./bull-mq/bull-board.router";

export const expressApp = express();

// Middlewares
expressApp.use(express.json({ limit: "50mb" }));

// Route handlers
expressApp.use(githubRouter);
expressApp.use(bullBoardRouter);

expressApp.use(yoga); // Leave Yoga last

// Error handler
expressApp.use(errorHandler);
