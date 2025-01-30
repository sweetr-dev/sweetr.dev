import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class RateLimitException extends BaseException {
  name = "RateLimitException";

  constructor(
    message = "Rate limit exceeded",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      userFacingMessage: "You have exceeded the rate limit.",
      severity: "log",
      ...options,
    });
  }
}
