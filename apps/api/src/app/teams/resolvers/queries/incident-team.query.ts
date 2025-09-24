import { Incident } from "@sweetr/graphql-types/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findTeamById } from "../../services/team.service";
import { transformTeam } from "../transformers/team.transformer";

export const incidentTeamQuery = createFieldResolver("Incident", {
  team: async (incident: Incident) => {
    logger.info("query.incident.team", { incident });

    if (!incident["teamId"]) return null;

    if (!incident["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const team = await findTeamById({
      teamId: incident["teamId"] as number,
      workspaceId: incident["workspaceId"] as number,
    });

    if (!team) return null;

    return transformTeam(team);
  },
});
