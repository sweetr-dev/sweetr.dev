import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { loginWithGithub } from "../../services/auth.service";

export const loginWithGithubMutation = createMutationResolver({
  loginWithGithub: async (_, { input }) => {
    logger.info("mutation.loginWithGithub", { input });

    const token = await loginWithGithub(input.code, input.state);

    return {
      token,
    };
  },
});
