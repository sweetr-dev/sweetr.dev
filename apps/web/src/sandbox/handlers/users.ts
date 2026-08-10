import { graphql, HttpResponse } from "msw";
import { subDays } from "date-fns";
import { PEOPLE } from "../fixtures/people";

const workspaceUsers = PEOPLE.map((person, i) => ({
  __typename: "WorkspaceUser" as const,
  id: person.id,
  name: person.name,
  handle: person.handle,
  avatar: person.avatar,
  role: i === 0 ? "ADMIN" : "MEMBER",
  lastLoginAt: i < 3 ? subDays(new Date(), i * 2).toISOString() : null,
}));

export const usersHandlers = [
  graphql.query("WorkspaceUsers", ({ variables }) => {
    const input = (variables.input ?? {}) as { cursor?: string };

    if (input.cursor) {
      return HttpResponse.json({
        data: {
          workspace: {
            __typename: "Workspace",
            users: [],
          },
        },
      });
    }

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          users: workspaceUsers,
        },
      },
    });
  }),
];
