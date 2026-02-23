import { AutomationType, PullRequest } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { logger } from "../../../lib/logger";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { findDeploymentByIdOrThrow } from "../../deployment/services/deployment.service";
import { findWorkspaceById } from "../../workspaces/services/workspace.service";
import { findAutomationByType } from "../../automations/services/automation.service";
import { isActiveCustomer } from "../../authorization.service";
import { IncidentDetectionSettings } from "../../automations/services/automation.types";
import { HandleIncidentDetectionAutomationArgs } from "./incident-detection.types";

interface DetectionResult {
  causeDeploymentId: number;
  fixDeploymentId: number;
}

export const handleIncidentDetectionAutomation = async ({
  workspaceId,
  deploymentId,
}: HandleIncidentDetectionAutomationArgs) => {
  const workspace = await findWorkspaceById(workspaceId);

  if (!workspace) {
    throw new ResourceNotFoundException(
      "handleDeploymentIncidentDetection: Workspace not found",
      { extra: { workspaceId } }
    );
  }

  const automation = await findAutomationByType({
    workspaceId,
    type: AutomationType.INCIDENT_DETECTION,
  });

  if (!automation?.enabled) return;

  if (!isActiveCustomer(workspace)) return;

  const settings = automation.settings as IncidentDetectionSettings;

  const deployment = await findDeploymentByIdOrThrow(
    { workspaceId, deploymentId },
    {
      include: {
        pullRequests: {
          include: {
            pullRequest: true,
          },
        },
      },
    }
  );

  const pullRequests = deployment.pullRequests.map((dp) => dp.pullRequest);

  const result =
    (await detectRollback(settings, deployment, workspaceId)) ??
    (await detectRevert(settings, pullRequests, deployment, workspaceId)) ??
    (await detectHotfix(settings, pullRequests, deployment, workspaceId));

  if (!result) return;

  const existingIncident = await getPrisma(workspaceId).incident.findFirst({
    where: { causeDeploymentId: result.causeDeploymentId, workspaceId },
  });

  if (existingIncident) {
    logger.info(
      "handleDeploymentIncidentDetection: Incident already exists for cause deployment",
      { causeDeploymentId: result.causeDeploymentId, existingIncident }
    );
    return;
  }

  await getPrisma(workspaceId).incident.create({
    data: {
      causeDeploymentId: result.causeDeploymentId,
      fixDeploymentId: result.fixDeploymentId,
      detectedAt: deployment.deployedAt,
      workspaceId,
    },
  });

  logger.info("handleDeploymentIncidentDetection: Incident created", {
    deploymentId,
    causeDeploymentId: result.causeDeploymentId,
    fixDeploymentId: result.fixDeploymentId,
  });
};

const detectRollback = async (
  settings: IncidentDetectionSettings,
  deployment: {
    id: number;
    version: string;
    applicationId: number;
    environmentId: number;
    deployedAt: Date;
  },
  workspaceId: number
): Promise<DetectionResult | null> => {
  if (!settings.rollback?.enabled) return null;

  const rolledBackTo = await getPrisma(workspaceId).deployment.findFirst({
    where: {
      workspaceId,
      applicationId: deployment.applicationId,
      environmentId: deployment.environmentId,
      version: deployment.version,
      deployedAt: { lt: deployment.deployedAt },
      id: { not: deployment.id },
      archivedAt: null,
    },
    orderBy: { deployedAt: "desc" },
  });

  if (!rolledBackTo) return null;

  const causeDeployment = await getPrisma(workspaceId).deployment.findFirst({
    where: {
      workspaceId,
      applicationId: deployment.applicationId,
      environmentId: deployment.environmentId,
      deployedAt: { gt: rolledBackTo.deployedAt },
      id: { not: deployment.id },
      archivedAt: null,
    },
    orderBy: { deployedAt: "asc" },
  });

  if (!causeDeployment) return null;

  logger.info("detectRollback: Rollback detected", {
    deploymentId: deployment.id,
    rolledBackToId: rolledBackTo.id,
    causeDeploymentId: causeDeployment.id,
  });

  return {
    causeDeploymentId: causeDeployment.id,
    fixDeploymentId: deployment.id,
  };
};

const detectRevert = async (
  settings: IncidentDetectionSettings,
  pullRequests: PullRequest[],
  deployment: { id: number; applicationId: number; environmentId: number },
  workspaceId: number
): Promise<DetectionResult | null> => {
  if (!settings.revert?.enabled) return null;

  const revertPattern = /^Revert "(.+)"$/;

  for (const pr of pullRequests) {
    const match = pr.title.match(revertPattern);
    if (!match) continue;

    const originalTitle = match[1];

    const originalPr = await getPrisma(workspaceId).pullRequest.findFirst({
      where: {
        title: originalTitle,
        repositoryId: pr.repositoryId,
        mergedAt: { not: null },
        id: { not: pr.id },
      },
      orderBy: { mergedAt: "desc" },
      include: {
        deploymentEvents: true,
      },
    });

    if (!originalPr) continue;

    const deploymentLink = originalPr.deploymentEvents.find(
      (de) => de.deploymentId !== deployment.id
    );

    if (!deploymentLink) continue;

    logger.info("detectRevert: Revert detected", {
      revertPrId: pr.id,
      originalPrId: originalPr.id,
      causeDeploymentId: deploymentLink.deploymentId,
    });

    return {
      causeDeploymentId: deploymentLink.deploymentId,
      fixDeploymentId: deployment.id,
    };
  }

  return null;
};

const detectHotfix = async (
  settings: IncidentDetectionSettings,
  pullRequests: PullRequest[],
  deployment: {
    id: number;
    applicationId: number;
    environmentId: number;
    deployedAt: Date;
  },
  workspaceId: number
): Promise<DetectionResult | null> => {
  if (!settings.hotfix?.enabled) return null;

  const { prTitleRegEx, branchRegEx, prLabelRegEx } = settings.hotfix;

  const isHotfix = pullRequests.some((pr) => {
    if (prTitleRegEx && new RegExp(prTitleRegEx, "i").test(pr.title)) {
      return true;
    }

    if (branchRegEx && new RegExp(branchRegEx, "i").test(pr.sourceBranch)) {
      return true;
    }

    if (prLabelRegEx) {
      const labels = (pr.labels as string[]) ?? [];
      if (labels.some((label) => new RegExp(prLabelRegEx, "i").test(label))) {
        return true;
      }
    }

    return false;
  });

  if (!isHotfix) return null;

  const previousDeployment = await getPrisma(workspaceId).deployment.findFirst({
    where: {
      workspaceId,
      applicationId: deployment.applicationId,
      environmentId: deployment.environmentId,
      deployedAt: { lt: deployment.deployedAt },
      id: { not: deployment.id },
      archivedAt: null,
    },
    orderBy: { deployedAt: "desc" },
  });

  if (!previousDeployment) return null;

  logger.info("detectHotfix: Hotfix detected", {
    deploymentId: deployment.id,
    causeDeploymentId: previousDeployment.id,
  });

  return {
    causeDeploymentId: previousDeployment.id,
    fixDeploymentId: deployment.id,
  };
};
