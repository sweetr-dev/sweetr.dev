import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { transformDeployment } from "../transformers/deployment.transformer";
import {
  findDeploymentById,
  paginateDeployments,
} from "../../services/deployment.service";

export const deploymentsQuery = createFieldResolver("Workspace", {
  deployments: async (workspace, { input }) => {
    logger.info("query.deployments", { workspace, input });

    if (!workspace.id || !input) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    const deployments = await paginateDeployments(workspace.id, {
      deploymentIds: input.ids || undefined,
      query: input.query || undefined,
      deployedAt: {
        from: input.deployedAt?.from || undefined,
        to: input.deployedAt?.to || undefined,
      },
      applicationIds: input.applicationIds || undefined,
      environmentIds: input.environmentIds || undefined,
      cursor: input.cursor || undefined,
      limit: input.limit || undefined,
    });

    return deployments.map(transformDeployment);
  },
  deployment: async (workspace, { deploymentId }) => {
    logger.info("query.workspace.deployment", { workspace, deploymentId });

    if (!workspace.id || !deploymentId) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    await protectWithPaywall(workspace.id);

    const deployment = await findDeploymentById({
      workspaceId: workspace.id,
      deploymentId,
    });

    if (!deployment) return null;

    return transformDeployment(deployment);
  },
});
