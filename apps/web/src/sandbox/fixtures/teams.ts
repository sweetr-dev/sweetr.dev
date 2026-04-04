import type {
  TeamsQuery,
  TeamQuery,
} from "@sweetr/graphql-types/frontend/graphql";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";
import { PEOPLE } from "./people";

const person = (id: string) => {
  const p = PEOPLE.find((p) => p.id === id)!;
  return {
    __typename: "Person" as const,
    id: p.id,
    avatar: p.avatar,
    handle: p.handle,
    name: p.name,
  };
};

const teamMember = (
  id: string,
  personId: string,
  role: TeamMemberRole = TeamMemberRole.ENGINEER,
) => ({
  __typename: "TeamMember" as const,
  id,
  role,
  person: person(personId),
});

export const TEAMS = [
  {
    id: "1",
    name: "Platform",
    description: "Core infrastructure and developer tooling",
    icon: "🛠️",
    startColor: "#6741d9",
    endColor: "#9775fa",
    archivedAt: null,
    members: [
      teamMember("tm-1", "1", TeamMemberRole.LEADER),
      teamMember("tm-2", "3"),
      teamMember("tm-3", "4"),
      teamMember("tm-4", "5"),
    ],
  },
  {
    id: "2",
    name: "Frontend",
    description: "Web application and UI components",
    icon: "🎨",
    startColor: "#1c7ed6",
    endColor: "#74c0fc",
    archivedAt: null,
    members: [
      teamMember("tm-5", "5", TeamMemberRole.LEADER),
      teamMember("tm-6", "6"),
      teamMember("tm-7", "1"),
    ],
  },
];

export const teamsFixture = {
  workspace: {
    __typename: "Workspace" as const,
    teams: TEAMS.map(({ members, ...team }) => ({
      __typename: "Team" as const,
      ...team,
      members: members.map(({ role: _role, ...m }) => m),
    })),
  },
} satisfies TeamsQuery;

export const teamFixture = (teamId: string): TeamQuery => {
  const team = TEAMS.find((t) => t.id === teamId) ?? TEAMS[0];
  return {
    workspace: {
      __typename: "Workspace",
      team: {
        __typename: "Team",
        ...team,
      },
    },
  };
};
