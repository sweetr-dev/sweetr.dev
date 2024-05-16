import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { transformPerson } from "../../../people/resolvers/transformers/people.transformer";
import { findTeamMemberById } from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const teamMemberQuery = createFieldResolver("TeamMember", {
  person: async (apiTeamMember, _, context) => {
    logger.info("query.teamMember.person", { teamMember: apiTeamMember });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    if (!apiTeamMember.id) {
      throw new ResourceNotFoundException("Team member not found");
    }

    const teamMember = await findTeamMemberById(
      context.workspaceId,
      apiTeamMember.id
    );

    if (!teamMember || !teamMember.gitProfile) {
      throw new ResourceNotFoundException("Team member not found");
    }

    return transformPerson(teamMember.gitProfile);
  },
  team: async (apiTeamMember, _, context) => {
    logger.info("query.teamMember.person", { teamMember: apiTeamMember });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    if (!apiTeamMember.id) {
      throw new ResourceNotFoundException("Team member not found");
    }

    const teamMember = await findTeamMemberById(
      context.workspaceId,
      apiTeamMember.id
    );

    if (!teamMember) {
      throw new ResourceNotFoundException("Team member not found");
    }

    return transformTeam(teamMember.team);
  },
});
