import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findTeamMembers } from "../../services/team.service";
import { transformTeamMember } from "../transformers/team-member.tranformer";

export const teamMembersQuery = createFieldResolver("Team", {
  members: async (team, _, context) => {
    logger.info("query.team.members", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const members = await findTeamMembers({
      workspaceId: context.workspaceId,
      teamId: team.id,
    });

    return members.map(transformTeamMember);
  },
});
