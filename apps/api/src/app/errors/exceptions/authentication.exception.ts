import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class AuthenticationException extends BaseException {
  name = "AuthenticationException";

  constructor(
    message = "Authentication error",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.UNAUTHENTICATED,
      userFacingMessage: "Please authenticate your credentials again.",
      severity: "log",
      ...options,
    });
  }
}
