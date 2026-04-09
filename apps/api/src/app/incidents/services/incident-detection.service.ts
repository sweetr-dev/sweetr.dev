import { AutomationType, PullRequest } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { logger } from "../../../lib/logger";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { findDeploymentByIdOrThrow } from "../../deployment/services/deployment.service";
import { findWorkspaceById } from "../../workspaces/services/workspace.service";
import {
  findAutomationByType,
  upsertAutomationSettings,
} from "../../automations/services/automation.service";
import { isActiveCustomer } from "../../authorization.service";
import { IncidentDetectionSettings } from "../../automations/services/automation.types";
import { HandleIncidentDetectionAutomationArgs } from "./incident-detection.types";
import { safeRegex } from "../../../lib/string";
import { DataIntegrityException } from "../../errors/exceptions/data-integrity.exception";

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

  if (result.causeDeploymentId === result.fixDeploymentId) {
    throw new DataIntegrityException(
      "handleDeploymentIncidentDetection: Cause and fix deployment IDs are the same",
      {
        extra: {
          deploymentId,
          result,
        },
      }
    );
  }

  const existingIncident = await getPrisma(workspaceId).incident.findFirst({
    where: {
      causeDeploymentId: result.causeDeploymentId,
      fixDeploymentId: result.fixDeploymentId,
      workspaceId,
    },
  });

  if (existingIncident) {
    logger.info("handleDeploymentIncidentDetection: Incident already exists", {
      causeDeploymentId: result.causeDeploymentId,
      existingIncident,
    });
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
      deployedAt: { gt: rolledBackTo.deployedAt, lt: deployment.deployedAt },
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
        deploymentEvents: {
          include: { deployment: true },
        },
      },
    });

    if (!originalPr) continue;

    const deploymentLink = originalPr.deploymentEvents
      .filter(
        (de) =>
          de.deployment.applicationId === deployment.applicationId &&
          de.deployment.environmentId === deployment.environmentId &&
          de.deploymentId !== deployment.id
      )
      .sort(
        (a, b) =>
          b.deployment.deployedAt.getTime() - a.deployment.deployedAt.getTime()
      )
      .at(0);

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

  const compiledTitleRegex = prTitleRegEx ? safeRegex(prTitleRegEx) : null;
  const compiledBranchRegex = branchRegEx ? safeRegex(branchRegEx) : null;
  const compiledLabelRegex = prLabelRegEx ? safeRegex(prLabelRegEx) : null;

  const isHotfix = pullRequests.some((pr) => {
    if (compiledTitleRegex?.test(pr.title)) return true;
    if (compiledBranchRegex?.test(pr.sourceBranch)) return true;

    if (compiledLabelRegex) {
      const labels = (pr.labels as string[]) ?? [];
      if (labels.some((label) => compiledLabelRegex.test(label))) return true;
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

export const initIncidentDetectionSettings = async (workspaceId: number) => {
  const automation = await findAutomationByType({
    workspaceId,
    type: AutomationType.INCIDENT_DETECTION,
  });

  if (automation) return;

  const defaultSettings: IncidentDetectionSettings = {
    revert: { enabled: true },
    rollback: { enabled: true },
    hotfix: {
      enabled: true,
      prTitleRegEx: "hotfix",
      branchRegEx: "^hotfix",
      prLabelRegEx: "hotfix",
    },
  };

  await upsertAutomationSettings({
    workspaceId,
    type: AutomationType.INCIDENT_DETECTION,
    enabled: true,
    settings: defaultSettings,
  });
};
