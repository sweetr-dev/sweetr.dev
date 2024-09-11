import { AutomationType, GitProvider, Installation } from "@prisma/client";
import { logger } from "../../../../lib/logger";
import { getBypassRlsPrisma } from "../../../../prisma";
import { isActiveCustomer } from "../../../workspace-authorization.service";
import { findAutomationByType } from "../../services/automation.service";
import { PullRequest } from "@octokit/webhooks-types";
import { getInstallationOctoKit } from "../../../../lib/octokit";

export const runPrSizeLabelerAutomation = async (
  gitInstallationId: number,
  gitPullRequest: PullRequest
) => {
  logger.info("[Automation] PR Title Check", {
    installationId: gitInstallationId,
    pullRequestId: gitPullRequest.node_id,
  });

  const automation = await getAutomation(gitInstallationId);

  if (!automation) return;

  await getInstallationOctoKit(gitInstallationId).rest.issues.addLabels({
    owner: gitPullRequest.base.repo.owner.login,
    repo: gitPullRequest.base.repo.name,
    issue_number: gitPullRequest.number,
    labels: ["Huge", "Large", "Medium", "Small", "Tiny"],
  });
};

const getAutomation = async (gitInstallationId: number) => {
  const workspace = await findWorkspace(gitInstallationId);

  if (!workspace) return;

  const automation = await findAutomationByType({
    workspaceId: workspace.id,
    type: AutomationType.PR_SIZE_LABELER,
  });

  if (!automation?.enabled) return;

  if (!isActiveCustomer(workspace)) return;

  if (!workspace.installation || !hasScope(workspace.installation)) return;

  return automation;
};

const hasScope = (installation: Installation) => {
  return installation.permissions?.["pull_requests"] === "write";
};

const findWorkspace = async (gitInstallationId: number) => {
  const workspace = await getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId: gitInstallationId.toString(),
        gitProvider: GitProvider.GITHUB,
      },
    },
    include: {
      organization: true,
      gitProfile: true,
      subscription: true,
      installation: true,
    },
  });

  if (!workspace) return null;

  if (!workspace.gitProfile && !workspace.organization) return null;

  return workspace;
};
