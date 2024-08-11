import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { paginateCodeReviews } from "../../services/code-review.service";
import { transformCodeReview } from "../transformers/code-review.transformer";

export const personCodeReviewsQuery = createFieldResolver("Person", {
  codeReviews: async (person, { input }, context) => {
    logger.info("query.person.codeReviews", { person, input });

    if (!person.id) {
      throw new ResourceNotFoundException("Person not found");
    }

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(context.workspaceId);

    const codeReviews = await paginateCodeReviews(
      context.workspaceId,
      person.id,
      {
        cursor: input?.cursor || undefined,
        to: input?.to ? new Date(input?.to) : undefined,
        from: input?.from ? new Date(input?.from) : undefined,
        state: input?.state || undefined,
      }
    );

    return codeReviews.map(transformCodeReview);
  },
});
