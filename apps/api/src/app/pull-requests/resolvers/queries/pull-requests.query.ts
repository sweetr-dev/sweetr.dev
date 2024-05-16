import { PullRequestOwnerType } from "@sweetr/graphql-types/dist/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { paginatePullRequests } from "../../services/pull-request.service";
import { transformPullRequest } from "../transformers/pull-request.transformer";

export const pullRequestsQuery = createFieldResolver("Workspace", {
  pullRequests: async (workspace, { input }) => {
    logger.info("query.pullRequests", { workspace, input });

    if (!workspace.id || !input) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const filterBy =
      input.ownerType === PullRequestOwnerType.TEAM
        ? "teamIds"
        : "gitProfileIds";

    const pullRequests = await paginatePullRequests(workspace.id, {
      [filterBy]: input.ownerIds,
      cursor: input?.cursor || undefined,
      createdAt: {
        from: input.createdAt?.from || undefined,
        to: input.createdAt?.to || undefined,
      },
      finalizedAt: {
        from: input.finalizedAt?.from || undefined,
        to: input.finalizedAt?.to || undefined,
      },
      states: input.states || undefined,
      sizes: input.sizes || undefined,
    });

    return pullRequests.map(transformPullRequest);
  },
});
