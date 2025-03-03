import { Team as DatabaseTeam } from "@prisma/client";
import { Team as ApiTeam } from "../../../../graphql-types";

export const transformTeam = (team: DatabaseTeam): ApiTeam => {
  return {
    ...team,
    id: team.id,
    archivedAt: team.archivedAt?.toISOString(),
    members: [],
    alerts: [],
    digests: [],
    pullRequestsInProgress: {
      changesRequested: [],
      drafted: [],
      pendingMerge: [],
      pendingReview: [],
    },
  };
};
