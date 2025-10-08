import { Incident } from "@sweetr/graphql-types/api";
import { createFieldResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { ResourceNotFoundException } from "../../../errors/exceptions/resource-not-found.exception";
import { findDeploymentById } from "../../services/deployment.service";
import { transformDeployment } from "../transformers/deployment.transformer";

export const incidentDeploymentsQuery = createFieldResolver("Incident", {
  causeDeployment: async (incident: Incident) => {
    logger.info("query.incident.causeDeployment", { incident });

    if (!incident["causeDeploymentId"]) {
      throw new ResourceNotFoundException("Cause deployment not found");
    }

    if (!incident["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const deployment = await findDeploymentById({
      workspaceId: incident["workspaceId"] as number,
      deploymentId: incident["causeDeploymentId"] as number,
    });

    if (!deployment) {
      throw new ResourceNotFoundException("Cause deployment not found");
    }

    return transformDeployment(deployment);
  },
  fixDeployment: async (incident: Incident) => {
    logger.info("query.incident.fixDeployment", { incident });

    if (!incident["fixDeploymentId"]) {
      return null;
    }

    if (!incident["workspaceId"]) {
      throw new ResourceNotFoundException("Workspace not found");
    }

    const deployment = await findDeploymentById({
      workspaceId: incident["workspaceId"] as number,
      deploymentId: incident["fixDeploymentId"] as number,
    });

    if (!deployment) {
      return null;
    }

    return transformDeployment(deployment);
  },
});
