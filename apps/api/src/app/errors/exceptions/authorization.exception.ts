import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class AuthorizationException extends BaseException {
  name = "AuthorizationException";

  constructor(
    message = "Authorization error",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.UNAUTHORIZED,
      userFacingMessage: "You do not have access to this resource.",
      severity: "log",
      statusCode: 401,
      ...options,
    });
  }
}
