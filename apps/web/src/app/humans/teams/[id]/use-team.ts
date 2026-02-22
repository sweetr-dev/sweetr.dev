import { useParams } from "react-router";
import { ResourceNotFound } from "../../../../exceptions/resource-not-found.exception";

export const useTeamId = () => {
  const { teamId } = useParams();

  if (!teamId) throw new ResourceNotFound();

  return teamId;
};
