import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";

export const chartsQuery = createFieldResolver("Workspace", {
  charts: async (workspace, { input }, context) => {
    logger.info("query.charts", { workspace, input });

    if (!workspace.id) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    if (!input.dateRange.from || !input.dateRange.to) {
      throw new InputValidationException("Date range is required");
    }

    context.chartFilter = {
      dateTimeRange: {
        from: input.dateRange.from,
        to: input.dateRange.to,
      },
      period: input.period,
      teamId: input.teamId,
    };

    return {};
  },
});
