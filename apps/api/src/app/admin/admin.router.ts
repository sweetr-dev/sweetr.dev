import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getBypassRlsPrisma } from "../../prisma";
import { addJob, SweetQueue } from "../../bull-mq/queues";
import { logger } from "../../lib/logger";
import { validateInputOrThrow } from "../validator.service";
import { validateAdminSecret } from "./middlewares/validate-admin-secret.middleware";

const syncWorkspacesSchema = z.object({
  workspaceIds: z.union([z.array(z.number()), z.literal("all")]),
  delayBetween: z.number().min(0).default(60_000),
});

export const adminRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/admin/sync-workspaces",
    { preHandler: validateAdminSecret },
    async (request, reply) => {
      const { workspaceIds, delayBetween } = await validateInputOrThrow(
        syncWorkspacesSchema,
        request.body as never
      );

      const prisma = getBypassRlsPrisma();
      const uniqueIds =
        workspaceIds !== "all" ? [...new Set(workspaceIds)] : workspaceIds;

      const workspaces = await prisma.workspace.findMany({
        where: {
          ...(uniqueIds !== "all" ? { id: { in: uniqueIds } } : {}),
          installation: {
            suspendedAt: null,
          },
        },
        include: {
          installation: true,
          organization: true,
        },
      });

      let queued = 0;

      for (const [i, workspace] of workspaces.entries()) {
        const installation = workspace.installation;

        if (!installation) continue;

        const delay = i * delayBetween;
        const installationId = parseInt(installation.gitInstallationId);

        if (workspace.organization) {
          await addJob(
            SweetQueue.GITHUB_MEMBERS_SYNC,
            {
              action: "installation",
              organization: { login: workspace.organization.handle },
              installation: { id: installationId },
            },
            { delay }
          );
        }

        await addJob(
          SweetQueue.GITHUB_REPOSITORIES_SYNC,
          { installation: { id: installationId } },
          { delay }
        );

        queued++;
      }

      const skipped =
        uniqueIds === "all"
          ? 0
          : uniqueIds.length - queued;

      logger.info("admin/sync-workspaces", { queued, skipped, delayBetween });

      return reply.code(200).send({ queued, skipped });
    }
  );
};
