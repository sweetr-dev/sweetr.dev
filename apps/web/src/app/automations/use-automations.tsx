import {
  Automation,
  AutomationType,
} from "@sweetr/graphql-types/frontend/graphql";
import { objectify } from "radash";
import { useWorkspace } from "../../providers/workspace.provider";
import { useAutomationsQuery } from "../../api/automation.api";

interface UseAutomations {
  automationSettings: Record<AutomationType, Automation> | undefined;
  isLoading: boolean;
}

export const useAutomationSettings = (): UseAutomations => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = useAutomationsQuery({
    workspaceId: workspace.id,
  });

  const automations: Record<AutomationType, Automation> | undefined = objectify(
    data?.workspace.automations || [],
    (i) => i.type,
  );

  return {
    automationSettings: automations,
    isLoading,
  };
};
