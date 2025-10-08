import express from "express";
import { isProduction } from "../env";
import { logger } from "./logger";
import { captureException } from "./sentry";

export type RouteHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => Promise<void>;

// It catches the error and send it to the registered express error handler
export function catchErrors(fn: RouteHandler) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    fn(req, res, next).catch(next);
  };
}

export function errorHandler(
  error: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  logger.error("Express error handler", error);
  Error.captureStackTrace(error);
  captureException(error);

  res.status(500).send({
    error: error.message,
    statusCode: 500,
    ...(isProduction ? {} : { stack: error.stack }),
  });
}
