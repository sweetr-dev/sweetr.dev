import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { upsertIncident } from "../../services/incident.service";
import { transformIncident } from "../transformers/incident.transformer";

export const upsertIncidentMutation = createMutationResolver({
  upsertIncident: async (_, { input }, context) => {
    logger.info("mutation.upsertIncident", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const incident = await upsertIncident({
      ...input,
      incidentId: input.incidentId ?? undefined,
      detectedAt: new Date(input.detectedAt),
      resolvedAt: input.resolvedAt ? new Date(input.resolvedAt) : null,
    });

    return transformIncident(incident);
  },
});
