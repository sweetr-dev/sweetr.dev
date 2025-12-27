import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class DataIntegrityException extends BaseException {
  name = "DataIntegrityException";

  constructor(
    message = "Data integrity exception",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.DATA_INTEGRITY,
      userFacingMessage: "Something went wrong.",
      severity: "error",
      ...options,
    });
  }
}
