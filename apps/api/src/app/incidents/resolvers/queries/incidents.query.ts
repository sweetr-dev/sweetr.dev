import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import {
  findIncidentById,
  paginateIncidents,
} from "../../services/incident.service";
import { transformIncident } from "../transformers/incident.transformer";

export const incidentsQuery = createFieldResolver("Workspace", {
  incidents: async (workspace, { input }) => {
    logger.info("query.workspace.incidents", { workspace, input });

    if (!workspace.id || !input) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    const incidents = await paginateIncidents(workspace.id, {
      applicationIds: input.applicationIds,
      environmentIds: input.environmentIds,
      detectedAt: {
        from: input.detectedAt?.from || undefined,
        to: input.detectedAt?.to || undefined,
      },
      cursor: input.cursor || undefined,
      limit: input.limit || undefined,
    });

    return incidents.map(transformIncident);
  },
  incident: async (workspace, { incidentId }) => {
    logger.info("query.workspace.incident", { workspace, incidentId });

    if (!workspace.id || !incidentId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const incident = await findIncidentById({
      workspaceId: workspace.id,
      incidentId,
    });

    if (!incident) return null;

    return transformIncident(incident);
  },
});
