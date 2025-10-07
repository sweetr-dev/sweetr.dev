import { Deployment as DatabaseDeployment } from "@prisma/client";
import { Deployment as ApiDeployment } from "../../../../graphql-types";

export const transformDeployment = (
  application: DatabaseDeployment
): Omit<
  ApiDeployment,
  "application" | "environment" | "pullRequests" | "pullRequestCount"
> => {
  return {
    ...application,
    deployedAt: application.deployedAt?.toISOString(),
    archivedAt: application.archivedAt?.toISOString(),
  };
};
