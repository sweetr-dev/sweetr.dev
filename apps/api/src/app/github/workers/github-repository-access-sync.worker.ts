import { Job } from "bullmq";
import type {
  MemberAddedEvent,
  MemberRemovedEvent,
  MembershipAddedEvent,
  MembershipRemovedEvent,
  TeamAddedToRepositoryEvent,
  TeamRemovedFromRepositoryEvent,
} from "@octokit/webhooks-types";
import { createWorker } from "../../../bull-mq/workers";
import { SweetQueue } from "../../../bull-mq/queues";
import { getBypassRlsPrisma } from "../../../prisma";
import { InputValidationException } from "../../errors/exceptions/input-validation.exception";
import { findWorkspaceByGitInstallationId } from "../../workspaces/services/workspace.service";
import { withDelayedRetryOnRateLimit } from "../services/github-rate-limit.service";
import type { RepositoryAccessSyncJobPayload } from "../services/github-repository-access.types";
import {
  enqueueRepositoryAccessSyncJobs,
  listTeamRepositoryInternalIds,
  resolveTeamSlug,
  syncRepositoryAccess,
} from "../services/github-repository-access.service";
import { logger } from "../../../lib/logger";

const isDirectPayload = (
  data: unknown
): data is RepositoryAccessSyncJobPayload =>
  typeof data === "object" &&
  data !== null &&
  "workspaceId" in data &&
  "gitInstallationId" in data &&
  "repositoryId" in data &&
  typeof (data as RepositoryAccessSyncJobPayload).workspaceId === "number" &&
  typeof (data as RepositoryAccessSyncJobPayload).gitInstallationId ===
    "number" &&
  typeof (data as RepositoryAccessSyncJobPayload).repositoryId === "number";

const isTeamRepositoryEvent = (
  data: unknown
): data is TeamAddedToRepositoryEvent | TeamRemovedFromRepositoryEvent =>
  typeof data === "object" &&
  data !== null &&
  "action" in data &&
  ((data as { action: string }).action === "added_to_repository" ||
    (data as { action: string }).action === "removed_from_repository") &&
  "repository" in data &&
  (data as TeamAddedToRepositoryEvent).repository != null;

const isMemberEvent = (
  data: unknown
): data is MemberAddedEvent | MemberRemovedEvent =>
  typeof data === "object" &&
  data !== null &&
  "action" in data &&
  ((data as { action: string }).action === "added" ||
    (data as { action: string }).action === "removed") &&
  "repository" in data &&
  !("scope" in data);

const isMembershipWebhookPayload = (
  data: unknown
): data is MembershipAddedEvent | MembershipRemovedEvent => {
  if (typeof data !== "object" || data === null || !("action" in data)) {
    return false;
  }
  const action = (data as { action: string }).action;
  if (action !== "added" && action !== "removed") {
    return false;
  }
  if (!("scope" in data)) {
    return false;
  }
  const scope = (data as { scope: string }).scope;
  return scope === "team" || scope === "organization";
};

export const githubRepositoryAccessSyncWorker = createWorker(
  SweetQueue.GITHUB_REPOSITORY_ACCESS_SYNC,
  async (job: Job, token?: string) => {
    const data = job.data;

    if (isDirectPayload(data)) {
      await withDelayedRetryOnRateLimit(
        () =>
          syncRepositoryAccess(
            data.workspaceId,
            data.gitInstallationId,
            data.repositoryId
          ),
        {
          job,
          jobToken: token,
          installationId: data.gitInstallationId,
        }
      );
      return;
    }

    const installationId = (data as { installation?: { id: number } })
      .installation?.id;

    if (!installationId) {
      throw new InputValidationException("Missing installation", { job });
    }

    const workspace = await findWorkspaceByGitInstallationId(
      installationId.toString()
    );

    if (!workspace) {
      return;
    }

    if (isTeamRepositoryEvent(data)) {
      const ghRepo = data.repository!;
      const repository = await getBypassRlsPrisma().repository.findFirst({
        where: {
          workspaceId: workspace.id,
          gitRepositoryId: ghRepo.node_id,
        },
      });

      if (!repository) {
        return;
      }

      await withDelayedRetryOnRateLimit(
        () => syncRepositoryAccess(workspace.id, installationId, repository.id),
        {
          job,
          jobToken: token,
          installationId,
        }
      );
      return;
    }

    if (isMembershipWebhookPayload(data)) {
      if (data.scope === "organization") {
        const repos = await getBypassRlsPrisma().repository.findMany({
          where: { workspaceId: workspace.id },
          select: { id: true },
        });
        await enqueueRepositoryAccessSyncJobs(
          workspace.id,
          installationId,
          repos.map((r) => r.id)
        );
        return;
      }

      await withDelayedRetryOnRateLimit(
        async () => {
          const orgLogin = data.organization.login;
          const teamSlug = await resolveTeamSlug(
            installationId,
            data.organization,
            data.team
          );

          const repoIds = await listTeamRepositoryInternalIds(
            installationId,
            orgLogin,
            teamSlug,
            workspace.id
          );

          await enqueueRepositoryAccessSyncJobs(
            workspace.id,
            installationId,
            repoIds
          );
        },
        {
          job,
          jobToken: token,
          installationId,
        }
      );
      return;
    }

    if (isMemberEvent(data)) {
      const repository = await getBypassRlsPrisma().repository.findFirst({
        where: {
          workspaceId: workspace.id,
          gitRepositoryId: data.repository.node_id,
        },
      });

      if (!repository) {
        logger.warn("[GITHUB_REPOSITORY_ACCESS_SYNC] Repository not found", {
          jobId: job.id,
          workspaceId: workspace.id,
          installationId,
          repositoryNodeId: data.repository.node_id,
        });

        return;
      }

      await withDelayedRetryOnRateLimit(
        () => syncRepositoryAccess(workspace.id, installationId, repository.id),
        {
          job,
          jobToken: token,
          installationId,
        }
      );
      return;
    }

    throw new InputValidationException(
      "Unknown repository access job payload",
      { job }
    );
  },
  {
    limiter: {
      max: 5,
      duration: 1000,
    },
  }
);
