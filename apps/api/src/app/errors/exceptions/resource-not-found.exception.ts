import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

export class ResourceNotFoundException extends BaseException {
  name = "ResourceNotFoundException";

  constructor(
    message = "Resource not found",
    options?: Partial<BaseExceptionOptions>
  ) {
    super(message, {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      userFacingMessage: "Could not find the requested resource.",
      severity: "log",
      ...options,
    });
  }
}
