import { Switch } from "@mantine/core";
import { BoxSetting } from "../box-setting";
import { useUpdateAutomationMutation } from "../../../../../api/automation.api";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";

interface SettingEnableProps {
  type: AutomationType;
  enabled?: boolean;
}

export const SettingEnable = ({
  type,
  enabled = false,
}: SettingEnableProps) => {
  const { workspace } = useWorkspace();
  const { mutate, isPending } = useUpdateAutomationMutation({
    onSuccess: (automation) => {
      showSuccessNotification({
        message: `Automation ${
          automation.updateAutomation.enabled ? "enabled" : "disabled"
        }.`,
      });
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const handleChange = (isEnabled: boolean) => {
    mutate({
      input: {
        workspaceId: workspace.id,
        type,
        enabled: isEnabled,
      },
    });
  };

  return (
    <BoxSetting left="Enabled">
      <Switch
        size="lg"
        color="green.7"
        onLabel="ON"
        offLabel="OFF"
        checked={enabled}
        onChange={(event) => handleChange(event.currentTarget.checked)}
        disabled={isPending}
      />
    </BoxSetting>
  );
};
