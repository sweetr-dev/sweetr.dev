import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import {
  findDigestByType,
  findDigestsByTeam,
} from "../../services/digest.service";
import { Digest } from "../../services/digest.types";
import { transformDigest } from "../transformers/digest.transformer";

export const teamDigestsQuery = createFieldResolver("Team", {
  digest: async (team, { input }, context) => {
    logger.info("query.team.digest", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const digest = await findDigestByType({
      workspaceId: context.workspaceId,
      teamId: team.id,
      type: input.type,
    });

    if (!digest) return null;

    return transformDigest(digest as Digest);
  },
  digests: async (team, _, context) => {
    logger.info("query.team.digests", { team });

    if (!team.id) {
      throw new ResourceNotFoundException("Team not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const digests = await findDigestsByTeam(context.workspaceId, team.id);

    return digests.map(transformDigest);
  },
});
