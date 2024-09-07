import { Team as DatabaseTeam } from "@prisma/client";
import { Team as ApiTeam } from "@sweetr/graphql-types/api";

export const transformTeam = (team: DatabaseTeam): ApiTeam => {
  return {
    ...team,
    id: team.id,
    archivedAt: team.archivedAt?.toISOString(),
    members: [],
  };
};
