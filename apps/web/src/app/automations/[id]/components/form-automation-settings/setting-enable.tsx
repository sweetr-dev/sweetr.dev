import { Switch } from "@mantine/core";
import { BoxSetting } from "./box-setting";
import { useUpdateAutomationMutation } from "../../../../../api/automation.api";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { Automation } from "@sweetr/graphql-types/frontend/graphql";

interface SettingEnableProps {
  automation: Pick<Automation, "slug" | "enabled">;
}

export const SettingEnable = ({ automation }: SettingEnableProps) => {
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
        slug: automation.slug,
        enabled: isEnabled,
      },
    });
  };

  return (
    <BoxSetting label="Enabled">
      <Switch
        size="lg"
        color="green.7"
        onLabel="ON"
        offLabel="OFF"
        checked={automation.enabled}
        onChange={(event) => handleChange(event.currentTarget.checked)}
        disabled={isPending}
      />
    </BoxSetting>
  );
};
