import { AutomationType, PullRequestState } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createTestContextWithGitProfile } from "../../../../test/integration-setup/context";
import {
  seedApplication,
  seedAutomation,
  seedDeployment,
  seedDeploymentPullRequest,
  seedEnvironment,
  seedGitProfile,
  seedPullRequest,
  seedRepository,
} from "../../../../test/seed";
import { getPrisma } from "../../../prisma";
import { handleIncidentDetectionAutomation } from "./incident-detection.service";

async function setupBaseContext() {
  const ctx = await createTestContextWithGitProfile();
  const gitProfile = await seedGitProfile(ctx);
  const repository = await seedRepository(ctx);
  const application = await seedApplication(ctx, repository.repositoryId);
  const environment = await seedEnvironment(ctx);

  return { ctx, gitProfile, repository, application, environment };
}

describe("Incident Detection", () => {
  describe("Hotfix", () => {
    it("detects hotfix when PR title matches regex", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: true, prTitleRegEx: "hotfix" },
        },
      });

      const previousDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T10:00:00Z"), version: "1.0.0" }
      );

      const hotfixPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "hotfix: fix critical bug",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const hotfixDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        hotfixDeployment.deploymentId,
        hotfixPr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: hotfixDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(
        previousDeployment.deploymentId
      );
      expect(incidents[0].fixDeploymentId).toBe(
        hotfixDeployment.deploymentId
      );
    });

    it("detects hotfix when branch name matches regex", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: true, branchRegEx: "^hotfix/" },
        },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Fix login crash",
          sourceBranch: "hotfix/login-crash",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const hotfixDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        hotfixDeployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: hotfixDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
    });

    it("detects hotfix when PR label matches regex", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: true, prLabelRegEx: "^hotfix$" },
        },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Fix payment processing",
          labels: ["hotfix", "urgent"],
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const hotfixDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        hotfixDeployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: hotfixDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
    });

    it("does not detect hotfix when no PR matches any pattern", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: {
            enabled: true,
            prTitleRegEx: "hotfix",
            branchRegEx: "^hotfix/",
          },
        },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Add new feature",
          sourceBranch: "feature/new-feature",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.1.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect hotfix when there is no previous deployment", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: true, prTitleRegEx: "hotfix" },
        },
      });

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "hotfix: initial deploy fix",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect hotfix when hotfix detection is disabled", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: false, prTitleRegEx: "hotfix" },
        },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "hotfix: fix critical bug",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("uses case-insensitive matching for hotfix patterns", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: true, prTitleRegEx: "hotfix" },
        },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "HOTFIX: Fix critical bug",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
    });

    it("identifies the correct previous deployment as cause across multiple deployments", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          hotfix: { enabled: true, prTitleRegEx: "hotfix" },
        },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-08T10:00:00Z"),
        version: "0.9.0",
      });

      const immediatelyPreviousDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T10:00:00Z"), version: "1.0.0" }
      );

      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "hotfix: urgent fix",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T12:00:00Z"),
        }
      );

      const hotfixDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        hotfixDeployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: hotfixDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(
        immediatelyPreviousDeployment.deploymentId
      );
    });
  });

  describe("Rollback", () => {
    it("detects rollback when the same version was deployed before", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: true } },
      });

      // v1.0.0 deployed first
      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      // v1.1.0 deployed (this is the bad deploy)
      const badDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T12:00:00Z"), version: "1.1.0" }
      );

      // v1.0.0 deployed again (rollback)
      const rollbackDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollbackDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(badDeployment.deploymentId);
      expect(incidents[0].fixDeploymentId).toBe(
        rollbackDeployment.deploymentId
      );
    });

    it("identifies the first deployment after the rolled-back-to version as the cause", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: true } },
      });

      // v1.0.0
      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      // v1.1.0 — the actual cause (first after rolled-back-to)
      const causeDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T12:00:00Z"), version: "1.1.0" }
      );

      // v1.2.0 — also bad, but not the cause
      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T13:00:00Z"),
        version: "1.2.0",
      });

      // v1.0.0 again — rollback
      const rollbackDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollbackDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(
        causeDeployment.deploymentId
      );
    });

    it("does not detect rollback when the version was never deployed before", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: true } },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      const newDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T12:00:00Z"), version: "1.1.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: newDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect rollback when rollback detection is disabled", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: false } },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T12:00:00Z"),
        version: "1.1.0",
      });

      const rollbackDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollbackDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("ignores archived deployments when detecting rollback", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: true } },
      });

      // v1.0.0 deployed but then archived
      const archivedDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T10:00:00Z"), version: "1.0.0" }
      );

      await getPrisma(ctx.workspaceId).deployment.update({
        where: { id: archivedDeployment.deploymentId },
        data: { archivedAt: new Date() },
      });

      // v1.0.0 deployed again — not a rollback because original is archived
      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect rollback across different environments", async () => {
      const { ctx, application } = await setupBaseContext();
      const staging = await seedEnvironment(ctx, { name: "staging" });
      const production = await seedEnvironment(ctx, { name: "production" });

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: true } },
      });

      // v1.0.0 in staging
      await seedDeployment(ctx, application.applicationId, staging.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      // v1.0.0 in production — not a rollback, different environment
      const prodDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        production.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: prodDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });
  });

  describe("Revert", () => {
    it("detects revert when PR title matches revert pattern", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { revert: { enabled: true } },
      });

      // Original PR deployed
      const originalPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Add new payment flow",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T10:00:00Z"),
        }
      );

      const causeDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T11:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        causeDeployment.deploymentId,
        originalPr.pullRequestId
      );

      // Revert PR deployed
      const revertPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: 'Revert "Add new payment flow"',
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T14:00:00Z"),
        }
      );

      const revertDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T15:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        revertDeployment.deploymentId,
        revertPr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: revertDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(
        causeDeployment.deploymentId
      );
      expect(incidents[0].fixDeploymentId).toBe(
        revertDeployment.deploymentId
      );
    });

    it("does not detect revert when original PR was never deployed to the same app/env", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();
      const otherEnvironment = await seedEnvironment(ctx, {
        name: "staging",
      });

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { revert: { enabled: true } },
      });

      // Original PR deployed to a different environment
      const originalPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Add new payment flow",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T10:00:00Z"),
        }
      );

      const otherEnvDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        otherEnvironment.environmentId,
        { deployedAt: new Date("2024-01-10T11:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        otherEnvDeployment.deploymentId,
        originalPr.pullRequestId
      );

      // Revert PR deployed to production
      const revertPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: 'Revert "Add new payment flow"',
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T14:00:00Z"),
        }
      );

      const revertDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T15:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        revertDeployment.deploymentId,
        revertPr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: revertDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect revert when original PR is not found", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { revert: { enabled: true } },
      });

      const revertPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: 'Revert "Non-existent PR"',
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T14:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T15:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        revertPr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect revert when revert detection is disabled", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { revert: { enabled: false } },
      });

      const originalPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Add new payment flow",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T10:00:00Z"),
        }
      );

      const causeDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T11:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        causeDeployment.deploymentId,
        originalPr.pullRequestId
      );

      const revertPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: 'Revert "Add new payment flow"',
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T14:00:00Z"),
        }
      );

      const revertDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T15:00:00Z"), version: "1.0.1" }
      );

      await seedDeploymentPullRequest(
        ctx,
        revertDeployment.deploymentId,
        revertPr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: revertDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not detect revert when PR title does not match revert pattern", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { revert: { enabled: true } },
      });

      // PR with "revert" in title but not matching the exact pattern
      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Revert changes from last sprint",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T14:00:00Z"),
        }
      );

      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T15:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: deployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("links revert to the most recent deployment of the original PR in the same app/env", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { revert: { enabled: true } },
      });

      const originalPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "Add new payment flow",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T10:00:00Z"),
        }
      );

      // First deployment with the original PR
      const firstDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T11:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        firstDeployment.deploymentId,
        originalPr.pullRequestId
      );

      // Second deployment also including the original PR (e.g. cherry-pick)
      const secondDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T13:00:00Z"), version: "1.1.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        secondDeployment.deploymentId,
        originalPr.pullRequestId
      );

      // Revert PR
      const revertPr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: 'Revert "Add new payment flow"',
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T16:00:00Z"),
        }
      );

      const revertDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T17:00:00Z"), version: "1.2.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        revertDeployment.deploymentId,
        revertPr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: revertDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(
        secondDeployment.deploymentId
      );
    });
  });

  describe("General", () => {
    it("does not create an incident when automation is disabled", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: false,
        settings: { rollback: { enabled: true } },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T12:00:00Z"),
        version: "1.1.0",
      });

      const rollback = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollback.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(0);
    });

    it("does not create a duplicate incident for the same cause and fix", async () => {
      const { ctx, application, environment } = await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: { rollback: { enabled: true } },
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T12:00:00Z"),
        version: "1.1.0",
      });

      const rollback = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      // Run twice
      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollback.deploymentId,
      });

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollback.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      expect(incidents).toHaveLength(1);
    });

    it("rollback takes priority over revert and hotfix", async () => {
      const { ctx, gitProfile, repository, application, environment } =
        await setupBaseContext();

      await seedAutomation(ctx, {
        type: AutomationType.INCIDENT_DETECTION,
        enabled: true,
        settings: {
          rollback: { enabled: true },
          revert: { enabled: true },
          hotfix: { enabled: true, prTitleRegEx: "hotfix" },
        },
      });

      // v1.0.0 deployed
      await seedDeployment(ctx, application.applicationId, environment.environmentId, {
        deployedAt: new Date("2024-01-10T10:00:00Z"),
        version: "1.0.0",
      });

      // v1.1.0 deployed (bad)
      const badDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T12:00:00Z"), version: "1.1.0" }
      );

      // v1.0.0 deployed again (rollback) with a hotfix-titled PR
      const pr = await seedPullRequest(
        ctx,
        repository.repositoryId,
        gitProfile.gitProfileId,
        {
          title: "hotfix: rollback to stable",
          state: PullRequestState.MERGED,
          mergedAt: new Date("2024-01-10T13:30:00Z"),
        }
      );

      const rollbackDeployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        { deployedAt: new Date("2024-01-10T14:00:00Z"), version: "1.0.0" }
      );

      await seedDeploymentPullRequest(
        ctx,
        rollbackDeployment.deploymentId,
        pr.pullRequestId
      );

      await handleIncidentDetectionAutomation({
        workspaceId: ctx.workspaceId,
        deploymentId: rollbackDeployment.deploymentId,
      });

      const incidents = await getPrisma(ctx.workspaceId).incident.findMany({
        where: { workspaceId: ctx.workspaceId },
      });

      // Rollback is detected (cause is badDeployment, not previous from hotfix logic)
      expect(incidents).toHaveLength(1);
      expect(incidents[0].causeDeploymentId).toBe(badDeployment.deploymentId);
      expect(incidents[0].fixDeploymentId).toBe(
        rollbackDeployment.deploymentId
      );
    });
  });
});
