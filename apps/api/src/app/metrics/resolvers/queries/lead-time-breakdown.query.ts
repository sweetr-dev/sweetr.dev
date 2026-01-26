import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { getLeadTimeBreakdown } from "../../services/lead-time-breakdown.service";
import { GetLeadTimeBreakdownArgs } from "../../services/lead-time-breakdown.types";
import { transformLeadTimeBreakdown } from "../transformers/lead-time-breakdown.transformer";

export const leadTimeBreakdownQuery = createFieldResolver("LeadTimeMetric", {
  breakdown: async (parent, _, context) => {
    logger.info("query.metrics.dora.leadTime.breakdown", {
      workspaceId: context.workspaceId,
    });

    const args = parent["doraFilters"] as GetLeadTimeBreakdownArgs;
    const result = await getLeadTimeBreakdown(args);

    return transformLeadTimeBreakdown(result);
  },
});
