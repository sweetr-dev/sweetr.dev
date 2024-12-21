import { Job } from "bullmq";
import { env } from "../../env";
import { SweetQueue } from "../../bull-mq/queues";
import { getHttpClient } from "../../lib/got";
import { createWorker } from "../../bull-mq/workers";
import { getBypassRlsPrisma } from "../../prisma";
import { captureException } from "../../lib/sentry";
import { ResourceNotFoundException } from "../errors/exceptions/resource-not-found.exception";
import {
  getWorkspaceHandle,
  getWorkspaceName,
} from "../workspaces/services/workspace.service";
import { InstallationTargetType } from "@prisma/client";

export const saasNotifyNewInstallationWorker = createWorker(
  SweetQueue.SAAS_NOTIFY_NEW_INSTALLATION,
  async (job: Job<{ installationId: number }>) => {
    if (!env.SLACK_INSTALL_NOTIFICATION_WEBHOOK_URL) return;

    const installation = await getBypassRlsPrisma().installation.findUnique({
      where: { gitInstallationId: job.data.installationId.toString() },
      include: {
        workspace: {
          include: {
            organization: true,
            gitProfile: true,
            memberships: {
              include: {
                gitProfile: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!installation) {
      captureException(
        new ResourceNotFoundException(
          "[SaaS Notification] Could not find installation"
        )
      );
      return;
    }

    const member = installation.workspace.memberships.find(
      (member) => member.gitProfile.user?.id
    );

    const httpClient = await getHttpClient();

    httpClient.post(env.SLACK_INSTALL_NOTIFICATION_WEBHOOK_URL, {
      json: {
        url: `https://github.com/${getWorkspaceHandle(installation.workspace)}`,
        name: `${
          installation.targetType === InstallationTargetType.ORGANIZATION
            ? "🏢"
            : "🧑‍💻"
        } ${getWorkspaceName(installation.workspace)} 👥 ${installation.workspace.memberships.length} members`,
        user: `🙏 ${member?.gitProfile.name} ✉️ ${member?.gitProfile.user?.email} 😺 ${member?.gitProfile.handle}`,
      },
    });
  }
);
