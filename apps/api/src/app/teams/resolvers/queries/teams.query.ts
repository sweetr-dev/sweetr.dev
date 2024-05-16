import { createFieldResolver } from "../../../../lib/graphql";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findTeamById,
  findTeamsByWorkspace,
} from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const teamsQuery = createFieldResolver("Workspace", {
  team: async (workspace, { teamId }) => {
    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const team = await findTeamById({
      teamId,
      workspaceId: workspace.id,
    });

    if (!team) return null;

    return transformTeam(team);
  },
  teams: async (workspace, { input }) => {
    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const teams = await findTeamsByWorkspace({
      workspaceId: workspace.id,
      query: input?.query || undefined,
      limit: input?.limit || undefined,
    });

    return teams.map(transformTeam);
  },
});
