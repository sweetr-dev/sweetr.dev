import { Team as DatabaseTeam } from "@prisma/client";
import { Team as ApiTeam } from "../../../../graphql-types";

export const transformTeam = (
  team: DatabaseTeam
): Pick<
  ApiTeam,
  | "id"
  | "name"
  | "description"
  | "icon"
  | "startColor"
  | "endColor"
  | "archivedAt"
> => {
  return {
    ...team,
    id: team.id,
    archivedAt: team.archivedAt?.toISOString(),
  };
};
