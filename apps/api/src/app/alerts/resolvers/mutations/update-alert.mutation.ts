import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { validateInputOrThrow } from "../../../../lib/validate-input";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { upsertAlert } from "../../services/alert.service";
import { z } from "zod";
import { transformAlert } from "../transformers/alert.transformer";

export const updateAlertMutation = createMutationResolver({
  updateAlert: async (_, { input }, context) => {
    logger.info("mutation.updateAlert", { input });

    validateInputOrThrow(
      z.object({
        channel: z.string().max(80),
      }),
      input
    );

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    const alert = await upsertAlert({
      workspaceId: input.workspaceId,
      teamId: input.teamId,
      type: input.type,
      channel: input.channel,
      enabled: input.enabled,
      settings: input.settings,
    });

    return transformAlert(alert);
  },
});
