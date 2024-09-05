import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class IntegrationException extends BaseException {
  name = "IntegrationException";

  constructor(
    message = "Something went wrong",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.INTEGRATION_FAILED,
      userFacingMessage: "Integration failed. Please try again.",
      severity: "error",
      ...options,
    });
  }
}
