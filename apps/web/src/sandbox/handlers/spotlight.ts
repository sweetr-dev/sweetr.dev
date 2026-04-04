import { graphql, HttpResponse } from "msw";
import type { SpotlightQuery } from "@sweetr/graphql-types/frontend/graphql";
import { PEOPLE } from "../fixtures/people";
import { TEAMS } from "../fixtures/teams";

export const spotlightHandlers = [
  graphql.query("Spotlight", () => {
    const data: SpotlightQuery = {
      workspace: {
        __typename: "Workspace",
        people: PEOPLE.map((p) => ({
          __typename: "Person" as const,
          id: p.id,
          avatar: p.avatar,
          handle: p.handle,
          name: p.name,
        })),
        teams: TEAMS.map((t) => ({
          __typename: "Team" as const,
          id: t.id,
          name: t.name,
          description: t.description,
          icon: t.icon,
          startColor: t.startColor,
          endColor: t.endColor,
        })),
        repositories: [
          {
            __typename: "Repository",
            id: "1",
            name: "sweetr.dev",
            fullName: "sweetr-dev/sweetr.dev",
          },
        ],
        applications: [],
      },
    };
    return HttpResponse.json({ data });
  }),
];
