import { GraphQLError } from "graphql";
import { ClientError } from "graphql-request";

export const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const graphQLErrors = (error as ClientError).response
      .errors as GraphQLError[];

    const firstError = graphQLErrors[0];

    const extensions = firstError?.extensions as
      | {
          code: string;
          userFacingMessage: string;
        }
      | undefined;

    if (
      extensions &&
      [
        "INPUT_VALIDATION_FAILED",
        "RESOURCE_NOT_FOUND",
        "RATE_LIMIT_EXCEEDED",
      ].includes(extensions.code)
    ) {
      return extensions.userFacingMessage;
    }
  }

  return "Something went wrong. Please try again.";
};
