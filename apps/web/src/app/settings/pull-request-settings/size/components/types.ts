import { z } from "zod";
import { Person } from "@sweetr/graphql-types/frontend/graphql";

export const PullRequestSizeSettings = z.object({
  workspaceId: z.string().min(1),
  settings: z.object({
    pullRequest: z.object({
      size: z.object({
        tiny: z.number().min(1),
        small: z.number().min(1),
        medium: z.number().min(1),
        large: z.number().min(1),
      }),
    }),
  }),
});

export type PullRequestSizeSettings = z.infer<typeof PullRequestSizeSettings>;

export type PersonData = Pick<Person, "id" | "name" | "handle" | "avatar">;
