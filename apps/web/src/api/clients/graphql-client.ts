/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLClient } from "graphql-request";
import { ErrorCode } from "@sweetr/graphql-types/shared";
import { showErrorNotification } from "../../providers/notification.provider";
import { logout } from "../../providers/auth.provider";

export const graphQLClient = new GraphQLClient(
  import.meta.env.VITE_GRAPHQL_API,
  {
    responseMiddleware: (response) => {
      if (response instanceof Error) {
        return handleError((response as any).response);
      }
    },
  },
);

// TO-DO: Leverage zod to get rid of any
const handleError = (error: any) => {
  const errors: any[] = error.errors;

  if (!errors) return;

  const authenticationError = errors?.find((error) =>
    [ErrorCode.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED].includes(
      error.extensions.code,
    ),
  );

  if (authenticationError) {
    showErrorNotification({
      id: "logout-message",
      title: authenticationError.message,
      message: authenticationError.extensions.userFacingMessage,
    });

    logout();
  }
};

export const setAuthorizationHeader = (accessToken: string): void => {
  graphQLClient.setHeader("Authorization", `Bearer ${accessToken}`);
};
