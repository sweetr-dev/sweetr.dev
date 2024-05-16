import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class BusinessRuleException extends BaseException {
  name = "BusinessRuleException";

  constructor(
    message = "Business rule exception",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.BUSINESS_RULE,
      userFacingMessage: "Something went wrong.",
      severity: "error",
      ...options,
    });
  }
}
