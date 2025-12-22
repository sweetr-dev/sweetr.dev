import { findLatestDeployment, upsertDeployment } from "./deployment.service";
import { logger } from "../../../lib/logger";
import { DeploymentChangeType } from "@prisma/client";
import { hasChangedFilesInSubdirectory } from "./deployment-monorepo.service";
import { DataIntegrityException } from "../../errors/exceptions/data-integrity.exception";
import { linkPullRequestsToDeployment } from "./deployment-pr-linking.service";
import { CreateDeploymentFromPullRequestMergeArgs } from "./deployment-create-from-merge.types";
import { BusinessRuleException } from "../../errors/exceptions/business-rule.exception";

export const createDeploymentFromPullRequestMerge = async ({
  application,
  environment,
  pullRequest,
  workspaceId,
}: CreateDeploymentFromPullRequestMergeArgs) => {
  if (!pullRequest.mergedAt || !pullRequest.mergeCommitSha) {
    throw new BusinessRuleException(
      "Deployment cannot be created from a non-merged pull request",
      {
        extra: { pullRequest: pullRequest },
      }
    );
  }

  const deploymentSettings = application.deploymentSettings as {
    subdirectory?: string;
  };

  const subdirectory = deploymentSettings?.subdirectory;
  const files = pullRequest.files as { path: string }[];

  if (!files?.length) {
    throw new DataIntegrityException("Pull Request has no files", {
      extra: { pullRequest: pullRequest },
    });
  }

  const shouldSkip = subdirectory
    ? !hasChangedFilesInSubdirectory({
        files,
        subdirectory,
      })
    : false;

  if (shouldSkip) return;

  const latestDeployment = await findLatestDeployment({
    workspaceId,
    applicationId: application.id,
    environmentId: environment.id,
  });

  const deployment = await upsertDeployment({
    workspaceId,
    environmentId: environment.id,
    applicationId: application.id,
    authorId: pullRequest.authorId,
    deployedAt: pullRequest.mergedAt,
    commitHash: pullRequest.mergeCommitSha,
    version: pullRequest.mergeCommitSha,
    changeType: latestDeployment
      ? DeploymentChangeType.FORWARD
      : DeploymentChangeType.BASELINE,
    description: `Auto-deployed PR #${pullRequest.number}: ${pullRequest.title}`,
  });

  await linkPullRequestsToDeployment({
    workspaceId,
    deploymentId: deployment.id,
    pullRequestIds: [pullRequest.id],
  });

  logger.info("deploymentCreateFromMergeWorker: Deployment created", {
    deployment,
  });

  return deployment;
};
