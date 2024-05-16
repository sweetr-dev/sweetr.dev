import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class UnknownException extends BaseException {
  name = "UnknownException";

  constructor(
    message = "Something went wrong",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.UNAUTHORIZED,
      userFacingMessage: "Please try again.",
      severity: "error",
      ...options,
    });
  }
}
