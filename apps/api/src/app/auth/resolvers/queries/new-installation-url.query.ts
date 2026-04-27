import { GraphQLError } from "graphql";
import { createQueryResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { getGithubNewInstallationUrl } from "../../services/auth.service";
import { AuthProvider } from "../../../../graphql-types";

export const newInstallationUrlQuery = createQueryResolver({
  newInstallationUrl: (_, { input }) => {
    logger.info("query.newInstallationUrlQuery", { input });

    if (input.provider !== AuthProvider.GITHUB) {
      throw new GraphQLError("Not Supported");
    }

    return getGithubNewInstallationUrl();
  },
});
