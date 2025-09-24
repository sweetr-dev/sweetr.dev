import { Incident } from "@sweetr/graphql-types/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findGitProfileById } from "../../services/people.service";
import { transformPerson } from "../transformers/people.transformer";

export const incidentLeaderQuery = createFieldResolver("Incident", {
  leader: async (incident: Incident) => {
    logger.info("query.incident.leader", { incident });

    if (!incident["leaderId"]) {
      return null;
    }

    if (!incident["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const gitProfile = await findGitProfileById({
      workspaceId: incident["workspaceId"] as number,
      gitProfileId: incident["leaderId"] as number,
    });

    if (!gitProfile) {
      return null;
    }

    return transformPerson(gitProfile);
  },
});
