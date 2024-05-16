import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class DataAccessException extends BaseException {
  name = "DataAccessException";

  constructor(
    message = "Data access error",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      userFacingMessage: "Please try again.",
      severity: "error",
      ...options,
    });
  }
}
