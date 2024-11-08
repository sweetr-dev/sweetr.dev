import {
  DigestType,
  MutationUpdateDigestArgs,
} from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import {
  useTeamDigestQuery,
  useUpdateDigestMutation,
} from "../../../../../api/digest.api";
import { useDigestsCards } from "../use-digest-cards";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../../../../../providers/notification.provider";
import { useNavigate } from "react-router-dom";

interface UseDigestsProps {
  teamId: string;
  type: DigestType;
}

export const useDigest = ({ teamId, type }: UseDigestsProps) => {
  const { workspace } = useWorkspace();
  const { digestCards } = useDigestsCards();
  const digestCard = digestCards[type];
  const navigate = useNavigate();

  const { mutate: triggerMutation, ...mutation } = useUpdateDigestMutation({
    onSuccess: () => {
      showSuccessNotification({
        message: `Digest updated.`,
      });

      navigate(`/teams/${teamId}/digests`);
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
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
