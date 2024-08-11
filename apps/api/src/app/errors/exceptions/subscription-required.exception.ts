import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class SubscriptionRequiredException extends BaseException {
  name = "SubscriptionRequiredException";

  constructor(
    message = "Subscription required",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.SUBSCRIPTION_REQUIRED,
      userFacingMessage:
        "Your subscription has expired. Please subscribe again to gain access.",
      severity: "log",
      ...options,
    });
  }
}
