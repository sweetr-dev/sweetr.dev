import {
  DigestType,
  MutationUpdateDigestArgs,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import {
  useTeamDigestQuery,
  useUpdateDigestMutation,
} from "../../../../../api/digest.api";
import { useDigestCards } from "../use-digest-cards";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../../../providers/notification.provider";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../../../providers/error-message.provider";

interface UseDigestsProps {
  teamId: string;
  type: DigestType;
}

export const useDigest = ({ teamId, type }: UseDigestsProps) => {
  const { workspace } = useWorkspace();
  const { digestCards } = useDigestCards();
  const digestCard = digestCards[type];
  const navigate = useNavigate();

  const { mutate: triggerMutation, ...mutation } = useUpdateDigestMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: `Digest updated.`,
      });

      navigate(`/teams/${teamId}/digests`);
    },
    onError: (error) => {
      showErrorNotification({
        message: getErrorMessage(error),
      });
    },
  });

  const mutate = (input: MutationUpdateDigestArgs["input"]) => {
    triggerMutation({
      input,
    });
  };

  const { data, ...query } = useTeamDigestQuery({
    workspaceId: workspace.id,
    teamId,
    input: {
      type,
    },
  });

  return {
    digest: {
      ...digestCard,
      ...data?.workspace.team?.digest,
    },
    query,
    mutate,
    mutation,
  };
};
