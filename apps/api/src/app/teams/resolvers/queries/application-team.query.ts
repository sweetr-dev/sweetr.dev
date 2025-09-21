import { Application } from "../../../../graphql-types";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findTeamById } from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const applicationTeamQuery = createFieldResolver("Application", {
  team: async (application: Application) => {
    logger.info("query.application.team", { application });

    if (!application["teamId"]) return null;

    if (!application.id) {
      throw new ResourceNotFoundException("Application not found");
    }

    if (!application["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const team = await findTeamById({
      workspaceId: application["workspaceId"] as number,
      teamId: application["teamId"] as number,
    });

    if (!team) return null;

    return transformTeam(team);
  },
});
