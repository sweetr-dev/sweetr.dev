import { z } from "zod";
import { createMutationResolver } from "../../../../lib/graphql";
import { logger } from "../../../../lib/logger";
import { validateInputOrThrow } from "../../../../lib/validate-input";
import { protectWithPaywall } from "../../../billing/services/billing.service";
import { authorizeWorkspaceMemberOrThrow } from "../../../authorization.service";
import { sendTestMessage } from "../../slack/services/slack-integration.service";

export const sendTestMessageMutation = createMutationResolver({
  sendTestMessage: async (_, { input }, context) => {
    logger.info("mutation.sendTestMessage", { input });

    validateInputOrThrow(
      z.object({
        workspaceId: z.number(),
        channel: z.string().max(80),
      }),
      input
    );

    await authorizeWorkspaceMemberOrThrow({
      workspaceId: input.workspaceId,
      gitProfileId: context.currentToken.gitProfileId,
    });

    await protectWithPaywall(input.workspaceId);

    await sendTestMessage(input.workspaceId, input.channel);

    return null;
  },
});
