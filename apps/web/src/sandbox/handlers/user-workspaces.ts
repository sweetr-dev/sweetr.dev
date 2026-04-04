import { graphql, HttpResponse } from "msw";
import {
  userWorkspacesFixture,
  syncProgressFixture,
} from "../fixtures/workspace";

export const userWorkspacesHandlers = [
  graphql.query("UserWorkspaces", () => {
    return HttpResponse.json({ data: userWorkspacesFixture });
  }),

  graphql.query("WorkspaceSyncProgress", () => {
    return HttpResponse.json({ data: syncProgressFixture });
  }),
];
