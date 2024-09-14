import { AutomationType, PullRequestSize } from "@prisma/client";
import { logger } from "../../../../lib/logger";
import { getBypassRlsPrisma } from "../../../../prisma";
import {
  canRunAutomation,
  findAutomationByType,
  findWorkspaceByInstallationId,
} from "../../services/automation.service";
import { PullRequest } from "@octokit/webhooks-types";
import { getInstallationOctoKit } from "../../../../lib/octokit";
import { getPullRequestSize } from "../../../github/services/github-pull-request-tracking.service";
import { AutomationPrSizeLabeler } from "../../services/automation.types";
import { objectify } from "radash";
import { captureException } from "../../../../lib/sentry";
import { IntegrationException } from "../../../errors/exceptions/integration.exception";

export const runPrSizeLabelerAutomation = async (
  gitInstallationId: number,
  gitPullRequest: PullRequest
) => {
  logger.info("[Automation] PR Title Check", {
    installationId: gitInstallationId,
    pullRequestId: gitPullRequest.node_id,
  });

  const workspace = await findWorkspaceByInstallationId(gitInstallationId);

  if (!workspace) return;

  const automation = await findAutomationByType({
    workspaceId: workspace.id,
    type: AutomationType.PR_SIZE_LABELER,
  });

  if (
    !automation ||
    !canRunAutomation({
      automation,
      workspace,
      requiredScopes: [{ pull_requests: "write" }],
    })
  )
    return;

  const size = getPullRequestSize({
    linesAddedCount: gitPullRequest.additions,
    linesDeletedCount: gitPullRequest.deletions,
  });

  await maybeCreateLabels(gitInstallationId, automation, gitPullRequest);

  const labels = await getLabels(automation, gitPullRequest, size);

  await getInstallationOctoKit(gitInstallationId).rest.issues.setLabels({
    owner: gitPullRequest.base.repo.owner.login,
    repo: gitPullRequest.base.repo.name,
    issue_number: gitPullRequest.number,
    labels,
  });
};

// Returns the existing PR labels plus the new size label minus any other size label
const getLabels = async (
  automation: AutomationPrSizeLabeler,
  gitPullRequest: PullRequest,
  prSize: PullRequestSize
): Promise<string[]> => {
  const prLabels = gitPullRequest.labels.map((label) => label.name);
  const settings = getSettings(automation);
  const addLabel = settings.labels[prSize].label;
  const sizeLabels = Object.values(settings.labels).map((label) => label.label);

  return [addLabel, ...prLabels.filter((label) => !sizeLabels.includes(label))];
};

const maybeCreateLabels = async (
  gitInstallationId: number,
  automation: AutomationPrSizeLabeler,
  gitPullRequest: PullRequest
) => {
  try {
    const gitRepositoryId = gitPullRequest.base.repo.node_id;
    const settings = getSettings(automation);

    const hasCreatedLabelsBefore = settings.repositories.some(
      (repositoryId) => repositoryId === gitRepositoryId
    );
    if (hasCreatedLabelsBefore) return;

    const owner = gitPullRequest.base.repo.owner.login;
    const repo = gitPullRequest.base.repo.name;
    const octokit = await getInstallationOctoKit(gitInstallationId);

    const existingLabels = await getExistingLabels(
      gitInstallationId,
      owner,
      repo
    );

    const labelsToCreate = Object.values(settings.labels)
      .filter(({ label }) => !existingLabels[label])
      .map(({ label, color, description }) => ({
        name: label,
        color,
        description,
      }));

    try {
      for (const label of labelsToCreate) {
        await octokit.rest.issues.createLabel({
          owner,
          repo,
          ...label,
        });
      }
    } catch (error) {
      // 422 means the label already exists, which is fine
      if (error.status !== 422) {
        captureException(
          new IntegrationException(
            "[Automation][PR Size Labeler] Failed to create label",
            {
              originalError: error,
              extra: {
                gitPullRequest,
              },
            }
          )
        );
      }
    }

    // Update automation settings
    const updatedRepositories = [
      ...(automation.settings.repositories || []),
      gitPullRequest.base.repo.node_id,
    ];

    await getBypassRlsPrisma().automation.update({
      where: { id: automation.id },
      data: {
        settings: {
          ...automation.settings,
          repositories: updatedRepositories,
        },
      },
    });
  } catch (error) {
    captureException(error);
  }
};

const getExistingLabels = async (
  gitInstallationId: number,
  owner: string,
  repo: string
) => {
  try {
    const octokit = await getInstallationOctoKit(gitInstallationId);

    const { data } = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
    });

    return objectify(data, (label) => label.name);
  } catch {
    return {};
  }
};

const getSettings = (automation: AutomationPrSizeLabeler) => {
  const { repositories, labels } = automation.settings;

  return {
    repositories: repositories || [],
    labels: {
      [PullRequestSize.HUGE]: {
        label: labels?.huge?.label || "huge",
        color: (labels?.huge?.color || "#ff8787").replaceAll("#", ""),
        description: `Huge PR - High risk of reviewer fatigue`,
      },
      [PullRequestSize.LARGE]: {
        label: labels?.large?.label || "large",
        color: (labels?.large?.color || "#ff8787").replaceAll("#", ""),
        description: `Large PR - Consider splitting up into smaller PRs to reduce risk and review time`,
      },
      [PullRequestSize.MEDIUM]: {
        label: labels?.medium?.label || "medium",
        color: (labels?.medium?.color || "#a6a7ab").replaceAll("#", ""),
        description: `Medium PR - Strive for smaller PRs to reduce risk and review time`,
      },
      [PullRequestSize.SMALL]: {
        label: labels?.small?.label || "small",
        color: (labels?.small?.color || "#69db7c").replaceAll("#", ""),
        description: `Small PR - Quick and easy to review`,
      },
      [PullRequestSize.TINY]: {
        label: labels?.tiny?.label || "tiny",
        color: (labels?.tiny?.color || "#69db7c").replaceAll("#", ""),
        description: `Tiny PR - Quick and easy to review`,
      },
    },
  };
};
