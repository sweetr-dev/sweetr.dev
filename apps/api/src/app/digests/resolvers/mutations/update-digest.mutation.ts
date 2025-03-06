import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { validateInputOrThrow } from "../../../../lib/validate-input";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceOrThrow } from "../../../workspace-authorization.service";
import { upsertDigest } from "../../services/digest.service";
import { z } from "zod";
import { transformDigest } from "../transformers/digest.transformer";

export const updateDigestMutation = createMutationResolver({
  updateDigest: async (_, { input }, context) => {
    logger.info("mutation.updateDigest", { input });

    validateInputOrThrow(
      z.object({
        channel: z.string().max(80),
      }),
      input
    );

    await authorizeWorkspaceOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const digest = await upsertDigest({
      workspaceId: input.workspaceId,
      teamId: input.teamId,
      type: input.type,
      channel: input.channel,
      enabled: input.enabled,
      frequency: input.frequency,
      dayOfTheWeek: input.dayOfTheWeek,
      timeOfDay: input.timeOfDay,
      timezone: input.timezone,
      settings: input.settings,
    });

    return transformDigest(digest);
  },
});
