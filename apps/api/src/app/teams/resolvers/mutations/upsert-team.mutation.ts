import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import {
  authorizeTeamMembersOrThrow,
  upsertTeam,
} from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const upsertTeamMutation = createMutationResolver({
  upsertTeam: async (_, { input }, context) => {
    logger.info("mutation.upsertTeam", { input });

    authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    authorizeTeamMembersOrThrow({
      workspaceId: input.workspaceId,
      members: input.members,
    });

    await protectWithPaywall(input.workspaceId);

    const team = await upsertTeam({
      ...input,
      teamId: input.teamId ? input.teamId : undefined,
    });

    return transformTeam(team);
  },
});
