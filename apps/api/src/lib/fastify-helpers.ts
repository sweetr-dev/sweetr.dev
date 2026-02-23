import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { isProduction } from "../env";
import { logger } from "./logger";
import { captureException } from "./sentry";
import { BaseException } from "../app/errors/exceptions/base.exception";

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (
    error instanceof BaseException &&
    error.extensions?.statusCode &&
    typeof error.extensions.statusCode === "number" &&
    error.extensions.statusCode >= 400 &&
    error.extensions?.statusCode < 500
  ) {
    const statusCode = error.extensions.statusCode;

    return reply.code(statusCode).send({
      error: error.message,
      statusCode,
      validationErrors: error.extensions?.validationErrors ?? {},
    });
  }

  logger.error("Fastify error handler", error);

  if (!error.stack) Error.captureStackTrace(error);

  captureException(error);

  return reply.code(500).send({
    error: error.message,
    statusCode: 500,
    ...(isProduction ? {} : { stack: error.stack }),
  });
}
