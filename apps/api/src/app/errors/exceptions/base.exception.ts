import { GraphQLError, GraphQLErrorOptions } from "graphql";
import { ErrorCode } from "@sweetr/graphql-types/shared";
import { ExceptionSeverity } from "../../../lib/sentry";
export { ErrorCode } from "@sweetr/graphql-types/shared";

export interface BaseExceptionOptions {
  code: ErrorCode;
  userFacingMessage: string;
  originalError?: GraphQLErrorOptions["originalError"];
  severity?: ExceptionSeverity;
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

export class BaseException extends GraphQLError {
  extra?: Record<string, unknown>;
  severity?: ExceptionSeverity;

  constructor(
    message = "Something went wrong",
    options?: BaseExceptionOptions
  ) {
    const { originalError, ...errorOptions } = options || {
      extra: {},
      severity: "error",
    };

    super(message, {
      originalError,
      extensions: errorOptions,
    });

    this.extra = errorOptions.extra;
    this.severity = errorOptions.severity;
  }
}
