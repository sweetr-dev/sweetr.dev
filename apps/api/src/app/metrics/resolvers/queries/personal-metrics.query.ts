import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { getPersonalMetrics } from "../../services/personal-metrics.service";

export const chartsQuery = createFieldResolver("Person", {
  personalMetrics: async (person, _, context) => {
    logger.info("person.personalMetrics", {
      person,
      workspaceId: context.workspaceId,
    });

    if (!context.workspaceId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    if (!person.id) {
      throw new ResourceNotFoundException("Person not found");
    }

    return getPersonalMetrics(context.workspaceId, person.id);
  },
});
