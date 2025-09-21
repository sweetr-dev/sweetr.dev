import { Application as DatabaseApplication } from "@prisma/client";
import {
  Application as ApiApplication,
  DeploymentSettings,
} from "../../../../graphql-types";

export const transformApplication = (
  application: DatabaseApplication
): Omit<ApiApplication, "repository" | "team"> => {
  return {
    ...application,
    archivedAt: application.archivedAt?.toISOString(),
    deploymentSettings: application.deploymentSettings as DeploymentSettings,
  };
};
