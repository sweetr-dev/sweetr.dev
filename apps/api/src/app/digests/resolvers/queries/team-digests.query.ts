import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findDigestByType,
  findDigestsByTeam,
} from "../../services/digest.service";
import { Digest } from "../../services/digest.types";

import { transformDigest } from "../../transformers/digest.transformer";

export const teamDigestsQuery = createFieldResolver("Team", {
  digest: async (team, { input }) => {
    logger.info("query.team.digest", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    const workspaceId = "workspaceId" in team && (team.workspaceId as number);

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const digest = await findDigestByType({
      workspaceId,
      teamId: team.id,
      type: input.type,
    });

    if (!digest) return null;

    return transformDigest(digest as Digest);
  },
  digests: async (team) => {
    logger.info("query.team.digests", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    const workspaceId = "workspaceId" in team && (team.workspaceId as number);

    if (!workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const digests = await findDigestsByTeam(workspaceId, team.id);

    return digests.map(transformDigest);
  },
});
