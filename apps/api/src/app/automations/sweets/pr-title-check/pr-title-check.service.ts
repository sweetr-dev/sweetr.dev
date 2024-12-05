import { AutomationType, GitProvider, Installation } from "@prisma/client";
import { logger } from "../../../../lib/logger";
import { getBypassRlsPrisma } from "../../../../prisma";
import { isActiveCustomer } from "../../../workspace-authorization.service";
import { findAutomationByType } from "../../services/automation.service";
import { PullRequest } from "@octokit/webhooks-types";
import { getInstallationOctoKit } from "../../../../lib/octokit";
import { env } from "../../../../env";

export const runPrTitleCheckAutomation = async (
  gitInstallationId: number,
  gitPullRequest: PullRequest
) => {
  logger.info("[Automation] PR Title Check", {
    installationId: gitInstallationId,
    pullRequestId: gitPullRequest.node_id,
  });

  const automation = await getAutomation(gitInstallationId);

  if (!automation) return;

  const regex = getRegExp(automation.settings?.["regex"]);

  if (!regex) return;

  const regexExample = automation.settings?.["regexExample"];

  await getInstallationOctoKit(gitInstallationId).rest.repos.createCommitStatus(
    {
      owner: gitPullRequest.base.repo.owner.login,
      repo: gitPullRequest.base.repo.name,
      sha: gitPullRequest.head.sha,
      state: regex.test(gitPullRequest.title) ? "success" : "error",
      context: "[Sweetr] PR Title Check",
      target_url: `${env.FRONTEND_URL}/automations/pr-title-check`,
      description: regexExample
        ? `Compliant title example — ${regexExample}`
        : "Checks whether the PR title meets the requirements.",
    }
  );
};

const getRegExp = (regex?: string) => {
  if (!regex) return null;
  try {
    return new RegExp(regex);
  } catch {
    return null;
  }
};

const getAutomation = async (gitInstallationId: number) => {
  const workspace = await findWorkspace(gitInstallationId);

  if (!workspace) return;

  const automation = await findAutomationByType({
    workspaceId: workspace.id,
    type: AutomationType.PR_TITLE_CHECK,
  });

  if (!automation?.enabled) return;

  if (!isActiveCustomer(workspace)) return;

  if (!workspace.installation || !hasScope(workspace.installation)) return;

  return automation;
};

const hasScope = (installation: Installation) => {
  return installation.permissions?.["statuses"] === "write";
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
