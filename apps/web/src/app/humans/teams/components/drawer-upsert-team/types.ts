import { z } from "zod";
import {
  mustBeHexadecimal,
  stringCantBeEmpty,
} from "../../../../../providers/zod-rules.provider";
import { Person, TeamMemberRole } from "@sweetr/graphql-types/frontend/graphql";

export const TeamForm = z.object({
  teamId: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  name: stringCantBeEmpty,
  description: z.string(),
  startColor: mustBeHexadecimal,
  endColor: mustBeHexadecimal,
  icon: stringCantBeEmpty,
  members: z.array(
    z.object({
      id: z.string().optional(),
      role: z.nativeEnum(TeamMemberRole),
      person: z.object({
        id: z.string(),
        handle: z.string(),
        name: z.string().optional().nullable(),
        avatar: z.string().optional().nullable(),
      }),
    }),
  ),
});

export type TeamForm = z.infer<typeof TeamForm>;

export type PersonData = Pick<Person, "id" | "name" | "handle" | "avatar">;
