import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { upsertTeam } from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const upsertTeamMutation = createMutationResolver({
  upsertTeam: async (_, { input }, context) => {
    logger.info("mutation.upsertTeam", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const team = await upsertTeam({
      ...input,
      teamId: input.teamId ? input.teamId : undefined,
    });

    return transformTeam(team);
  },
});
