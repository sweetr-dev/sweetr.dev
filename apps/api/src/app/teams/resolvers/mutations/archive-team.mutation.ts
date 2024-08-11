import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { archiveTeam, unarchiveTeam } from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const archiveTeamMutation = createMutationResolver({
  archiveTeam: async (_, { input }) => {
    logger.info("mutation.archiveTeam", { input });

    await protectWithPaywall(input.workspaceId);

    const team = await archiveTeam(input.workspaceId, input.teamId);

    return transformTeam(team);
  },
  unarchiveTeam: async (_, { input }, context) => {
    logger.info("mutation.unarchiveTeam", { input });

    await protectWithPaywall(input.workspaceId);

    const team = await unarchiveTeam(input.workspaceId, input.teamId);

    return transformTeam(team);
  },
});
