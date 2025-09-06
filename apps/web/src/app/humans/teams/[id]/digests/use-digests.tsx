import { Digest, DigestType } from "@sweetr/graphql-types/frontend/graphql";
import { objectify } from "radash";
import { useTeamDigestsQuery } from "../../../../../api/digest.api";
import { useWorkspace } from "../../../../../providers/workspace.provider";

interface UseDigests {
  digests: Record<DigestType, Digest> | undefined;
  isLoading: boolean;
}

interface UseDigestsProps {
  teamId: string;
}

export const useDigests = ({ teamId }: UseDigestsProps): UseDigests => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = useTeamDigestsQuery({
    workspaceId: workspace.id,
    teamId,
  });

  const digests: Record<DigestType, Digest> | undefined = objectify(
    data?.workspace.team?.digests || [],
    (i) => i.type,
  );

  return {
    digests,
    isLoading,
  };
};
