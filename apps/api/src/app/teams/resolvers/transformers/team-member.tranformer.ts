import { TeamMember as DatabaseTeamMember } from "@prisma/client";
import { TeamMember, TeamMemberRole } from "@sweetr/graphql-types/api";

export const transformTeamMember = (
  teamMember: DatabaseTeamMember
): Omit<TeamMember, "person" | "team"> => {
  return {
    id: teamMember.id,
    role: teamMember.role as TeamMemberRole,
  };
};
