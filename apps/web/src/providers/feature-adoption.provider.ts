import { isAfter, parseISO } from "date-fns";
import { useWorkspace } from "./workspace.provider";
import { thirtyDaysAgo } from "./date.provider";
import { ResourceNotFound } from "../exceptions/resource-not-found.exception";

export const useFeatureAdoption = () => {
  const { workspace } = useWorkspace();

  const featureAdoption = workspace?.featureAdoption;

  if (!featureAdoption) {
    throw new ResourceNotFound("Feature adoption not found");
  }

  return {
    triedDeployments:
      featureAdoption.lastDeploymentCreatedAt &&
      isAfter(
        parseISO(featureAdoption.lastDeploymentCreatedAt),
        thirtyDaysAgo(),
      ),
  };
};
