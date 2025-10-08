import { Deployment as DatabaseDeployment } from "@prisma/client";
import { Deployment as ApiDeployment } from "../../../../graphql-types";

export const transformDeployment = (
  deployment: DatabaseDeployment
): Omit<
  ApiDeployment,
  "application" | "environment" | "pullRequests" | "pullRequestCount"
> => {
  return {
    ...deployment,
    deployedAt: deployment.deployedAt?.toISOString(),
    archivedAt: deployment.archivedAt?.toISOString(),
  };
};
