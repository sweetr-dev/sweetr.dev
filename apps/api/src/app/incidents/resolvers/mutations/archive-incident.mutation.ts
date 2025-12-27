import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import {
  archiveIncident,
  unarchiveIncident,
} from "../../services/incident.service";
import { transformIncident } from "../transformers/incident.transformer";

export const archiveIncidentMutation = createMutationResolver({
  archiveIncident: async (_, { input }, context) => {
    logger.info("mutation.archiveIncident", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const incident = await archiveIncident({
      workspaceId: input.workspaceId,
      incidentId: input.incidentId,
    });

    return transformIncident(incident);
  },
  unarchiveIncident: async (_, { input }, context) => {
    logger.info("mutation.unarchiveIncident", { input });

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const incident = await unarchiveIncident({
      workspaceId: input.workspaceId,
      incidentId: input.incidentId,
    });

    return transformIncident(incident);
  },
});

