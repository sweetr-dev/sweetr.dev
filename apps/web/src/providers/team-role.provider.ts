import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";

export const teamRoleColorMap: Record<TeamMemberRole, string> = {
  ENGINEER: "green",
  PRODUCT: "blue",
  DESIGNER: "violet",
  QA: "pink.4",
  LEADER: "yellow.2",
  MANAGER: "gray",
};

export const teamRoles = Object.keys(teamRoleColorMap) as TeamMemberRole[];
