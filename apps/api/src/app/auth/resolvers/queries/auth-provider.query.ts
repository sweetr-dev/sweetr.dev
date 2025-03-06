import { GraphQLError } from "graphql";
import { createQueryResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { getGithubLoginUrl } from "../../services/auth.service";
import { AuthProvider } from "../../../../graphql-types";

export const authProviderQuery = createQueryResolver({
  authProvider: (_, { input }) => {
    logger.info("query.authProviderQuery", { input });

    if (input.provider !== AuthProvider.GITHUB) {
      throw new GraphQLError("Not Supported");
    }

    return {
      redirectUrl: getGithubLoginUrl(input.redirectTo || undefined),
    };
  },
});
