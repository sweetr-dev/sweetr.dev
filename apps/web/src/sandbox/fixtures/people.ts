import type {
  PeopleQuery,
  PersonQuery,
  TeammatesQuery,
} from "@sweetr/graphql-types/frontend/graphql";
import { TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";

export const PEOPLE = [
  {
    id: "1",
    name: "Guest User",
    handle: "guest",
    avatar:
      "https://ui-avatars.com/api/?name=Guest+User&background=845ef7&color=fff",
    email: "guest@example.com",
  },
  {
    id: "3",
    name: "Priya Sharma",
    handle: "priyasharma",
    avatar:
      "https://ui-avatars.com/api/?name=Priya+Sharma&background=6741d9&color=fff",
    email: "priya@sweetr.dev",
  },
  {
    id: "4",
    name: "Alex Chen",
    handle: "alexchen",
    avatar:
      "https://ui-avatars.com/api/?name=Alex+Chen&background=1c7ed6&color=fff",
    email: "alex@sweetr.dev",
  },
  {
    id: "5",
    name: "Sam Rivera",
    handle: "samrivera",
    avatar:
      "https://ui-avatars.com/api/?name=Sam+Rivera&background=0ca678&color=fff",
    email: "sam@sweetr.dev",
  },
  {
    id: "6",
    name: "Jordan Kim",
    handle: "jordankim",
    avatar:
      "https://ui-avatars.com/api/?name=Jordan+Kim&background=e8590c&color=fff",
    email: "jordan@sweetr.dev",
  },
];

export const peopleFixture = {
  workspace: {
    people: PEOPLE.map(({ id, name, handle, avatar }) => ({
      __typename: "Person" as const,
      id,
      name,
      handle,
      avatar,
    })),
  },
} satisfies PeopleQuery;

export const personFixture = (handle: string): PersonQuery => {
  const person = PEOPLE.find((p) => p.handle === handle) ?? PEOPLE[0];
  return {
    workspace: {
      __typename: "Workspace",
      person: {
        __typename: "Person",
        id: person.id,
        name: person.name,
        handle: person.handle,
        avatar: person.avatar,
        bio: "Software engineer passionate about developer experience and tooling.",
        location: "San Francisco, CA",
        teamMemberships: [
          {
            __typename: "TeamMember",
            id: `tm-person-${person.id}`,
            role: TeamMemberRole.ENGINEER,
            team: {
              __typename: "Team",
              id: "1",
              name: "Platform",
              icon: "🛠️",
            },
          },
        ],
      },
    },
  };
};

export const teammatesFixture = (handle: string): TeammatesQuery => {
  const person = PEOPLE.find((p) => p.handle === handle) ?? PEOPLE[0];
  const teammates = PEOPLE.filter((p) => p.id !== person.id);
  return {
    workspace: {
      __typename: "Workspace",
      person: {
        __typename: "Person",
        id: person.id,
        teammates: teammates.map((t) => ({
          __typename: "TeamMember" as const,
          id: `teammate-${person.id}-${t.id}`,
          person: { __typename: "Person" as const, id: t.id },
        })),
      },
    },
  };
};
