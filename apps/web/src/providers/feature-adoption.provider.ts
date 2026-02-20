import { isAfter, parseISO } from "date-fns";
import { useWorkspace } from "./workspace.provider";
import { thirtyDaysAgo } from "./date.provider";

export const useFeatureAdoption = () => {
  const { workspace } = useWorkspace();

  const featureAdoption = workspace?.featureAdoption;

  if (!featureAdoption) {
    return {
      triedDeployments: false,
    };
  }

  return {
    triedDeployments:
      !!featureAdoption.lastDeploymentCreatedAt &&
      isAfter(
        parseISO(featureAdoption.lastDeploymentCreatedAt),
        thirtyDaysAgo(),
      ),
  };
};
