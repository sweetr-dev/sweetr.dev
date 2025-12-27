import { TeamMemberRole } from "@prisma/client";
import { z } from "zod";
import { getPrisma } from "../../../prisma";
import { AuthorizationException } from "../../errors/exceptions/authorization.exception";
import { STRING_INPUT_MAX_LENGTH } from "../../validator.service";

export const getTeamValidationSchema = (workspaceId: number) =>
  z.object({
    workspaceId: z.number(),
    name: z.string().max(STRING_INPUT_MAX_LENGTH),
    icon: z.string().emoji(),
    startColor: z.string().max(7),
    endColor: z.string().max(7),
    members: z
      .array(
        z.object({ personId: z.number(), role: z.nativeEnum(TeamMemberRole) })
      )
      .transform(async (members) => {
        const peopleCount = await getPrisma(
          workspaceId
        ).workspaceMembership.count({
          where: {
            workspaceId: workspaceId,
            gitProfileId: { in: members.map((member) => member.personId) },
          },
        });

        if (peopleCount !== members.length) {
          throw new AuthorizationException(
            "Some members do not belong to this workspace."
          );
        }

        return members;
      }),
    // Optional fields
    teamId: z.number().optional(),
    description: z.string().max(512).optional().nullable(),
  });
