import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import {
  findApplicationById,
  paginateApplications,
} from "../../services/application.service";
import { transformApplication } from "../transformers/application.transformer";

export const applicationsQuery = createFieldResolver("Workspace", {
  applications: async (workspace, { input }) => {
    logger.info("query.workspace.applications", { workspace, input });

    if (!workspace.id || !input) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    const applications = await paginateApplications(workspace.id, {
      applicationIds: input.ids || undefined,
      query: input.query || undefined,
      teamIds: input.teamIds || undefined,
      cursor: input.cursor || undefined,
      limit: input.limit || undefined,
    });

    return applications.map(transformApplication);
  },
  application: async (workspace, { applicationId }) => {
    logger.info("query.workspace.application", { workspace, applicationId });

    if (!workspace.id || !applicationId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const application = await findApplicationById({
      workspaceId: workspace.id,
      applicationId,
    });

    if (!application) return null;

    return transformApplication(application);
  },
});
