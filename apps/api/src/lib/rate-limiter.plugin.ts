import { useRateLimiter } from "@envelop/rate-limiter";
import { GraphQLContext } from "@sweetr/graphql-types/shared";
import { RateLimitException } from "../app/errors/exceptions/rate-limit.exception";

export const rateLimiterPlugin = useRateLimiter({
  identifyFn: (context: GraphQLContext) =>
    context.workspaceId?.toString() ?? context.currentToken.userId.toString(),
  transformError: (message: string) =>
    new RateLimitException("Rate limit exceeded", {
      userFacingMessage: message,
    }),
});
