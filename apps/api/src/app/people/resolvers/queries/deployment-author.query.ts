import { Deployment } from "@sweetr/graphql-types/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findGitProfileById } from "../../services/people.service";
import { transformPerson } from "../transformers/people.transformer";

export const deploymentAuthorQuery = createFieldResolver("Deployment", {
  author: async (deployment: Deployment) => {
    logger.info("query.deployment.author", { deployment });

    if (!deployment["authorId"]) return null;

    if (!deployment.id) {
      throw new ResourceNotFoundException("Deployment not found");
    }

    if (!deployment["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const author = await findGitProfileById({
      workspaceId: deployment["workspaceId"] as number,
      gitProfileId: deployment["authorId"] as number,
    });

    if (!author) return null;

    return transformPerson(author);
  },
});
