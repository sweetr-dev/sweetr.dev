import {
  BaseException,
  BaseExceptionOptions,
  ErrorCode,
} from "./base.exception";

interface InputValidationOptions extends BaseExceptionOptions {
  validationErrors?: string[];
}

export class InputValidationException extends BaseException {
  name = "InputValidationException";

  constructor(
    message = "Input is invalid",
    options?: Partial<InputValidationOptions>
  ) {
    super(message, {
      code: ErrorCode.INPUT_VALIDATION_FAILED,
      userFacingMessage: "Validation error, please fix the input.",
      severity: "log",
      ...options,
    });
  }
}
