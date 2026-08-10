import { LoginPolicy } from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../providers/workspace.provider";
import {
  useUpdateWorkspaceSettingsMutation,
  useWorkspaceSettingsQuery,
} from "../../../api/workspaces.api";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../providers/notification.provider";

export const useLoginPolicy = () => {
  const { workspace } = useWorkspace();

  const { data: settingsData, isLoading } = useWorkspaceSettingsQuery({
    workspaceId: workspace.id,
  });

  const { mutate: updateSettings } = useUpdateWorkspaceSettingsMutation({
    onSuccess: () => {
      showSuccessNotification({ message: "Login policy updated." });
    },
    onError: () => {
      showErrorNotification({ message: "Failed to update login policy." });
    },
  });

  const loginPolicy =
    settingsData?.workspace.settings.auth.loginPolicy ??
    LoginPolicy.WHOLE_ORG;

  const handlePolicyChange = (value: string | null) => {
    if (!value) return;
    updateSettings({
      input: {
        workspaceId: workspace.id,
        settings: {
          auth: {
            loginPolicy: value as LoginPolicy,
          },
        },
      },
    });
  };

  return { loginPolicy, handlePolicyChange, isLoading };
};
