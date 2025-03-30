import { useState } from "react";
import {
  useApiKeyQuery,
  useRegenerateApiKeyMutation,
} from "../../../../api/api-key.api";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { useConfirmationModal } from "../../../../providers/modal.provider";

export const useApiKey = () => {
  const { workspace } = useWorkspace();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { openConfirmationModal } = useConfirmationModal();

  const { mutateAsync: regenerate, isPending } = useRegenerateApiKeyMutation();

  const { data, isLoading } = useApiKeyQuery({
    workspaceId: workspace.id,
  });

  const handleRegenerate = () => {
    openConfirmationModal({
      title: "Regenerate API Key",
      label: (
        <>
          This action cannot be undone. This will invalidate your current key
          and any integrations using it will stop working. Are you sure you want
          to proceed?
        </>
      ),
      onConfirm: async () => {
        const result = await regenerate({
          input: { workspaceId: workspace.id },
        });

        setGeneratedKey(result.regenerateApiKey);
      },
    });
  };

  return {
    apiKey: data?.workspace.apiKey,
    generatedKey,
    isGenerating: isPending,
    isLoading,
    regenerate: handleRegenerate,
  };
};
