import type {
  SeedWorkspace,
  SeedApplication,
  SeedEnvironment,
  SeedGitProfile,
} from "../seed";
import {
  seedDeployment,
  seedPullRequest,
  seedDeploymentPullRequest,
  seedIncident,
} from "../seed";

/**
 * Timeline scenario helpers: generate realistic time-series data
 * for DORA metrics testing. All helpers walk time deterministically
 * and support configurable patterns.
 */

export interface TimelineOptions {
  /**
   * Start date for the timeline (UTC)
   */
  startDate: Date;

  /**
   * Number of weeks to generate data for
   */
  weeks: number;

  /**
   * Deploy only on weekdays (Monday-Friday)
   */
  weekdayOnly?: boolean;

  /**
   * Every Nth deployment causes an incident
   * e.g., everyNthIncident: 5 means every 5th deployment causes an incident
   */
  everyNthIncident?: number;

  /**
   * Number of deployments per week
   */
  deploymentsPerWeek?: number;
}

export interface TimelineResult {
  deployments: Array<{
    deploymentId: number;
    deployedAt: Date;
    pullRequestIds: number[];
    incidentId?: number;
  }>;
}

/**
 * Generates deployments across weeks with configurable patterns.
 * Time progression is explicit and deterministic.
 */
export async function generateDeploymentTimeline(
  ctx: SeedWorkspace,
  gitProfile: SeedGitProfile,
  application: SeedApplication,
  environment: SeedEnvironment,
  repositoryId: number,
  options: TimelineOptions
): Promise<TimelineResult> {
  const {
    startDate,
    weeks,
    weekdayOnly = false,
    everyNthIncident,
    deploymentsPerWeek = 5,
  } = options;

  const deployments: TimelineResult["deployments"] = [];
  const startTime = new Date(startDate);
  let deploymentCount = 0;

  // Generate deployments week by week
  for (let week = 0; week < weeks; week++) {
    const weekStart = new Date(startTime);
    weekStart.setUTCDate(weekStart.getUTCDate() + week * 7);

    // Distribute deployments across the week
    const daysInWeek = weekdayOnly ? 5 : 7;
    const deploymentsThisWeek = deploymentsPerWeek;

    for (let i = 0; i < deploymentsThisWeek; i++) {
      const dayOffset = Math.floor((i / deploymentsThisWeek) * daysInWeek);
      const deployedAt = new Date(weekStart);
      deployedAt.setUTCDate(deployedAt.getUTCDate() + dayOffset);
      deployedAt.setUTCHours(10 + (i % 8)); // Spread across 10-17 UTC

      // Skip weekends if weekdayOnly
      if (weekdayOnly) {
        const dayOfWeek = deployedAt.getUTCDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }
      }

      deploymentCount++;

      // Create a PR for this deployment
      const pr = await seedPullRequest(
        ctx,
        repositoryId,
        gitProfile.gitProfileId,
        {
          number: String(deploymentCount),
          title: `Deployment ${deploymentCount}`,
          mergedAt: new Date(deployedAt.getTime() - 2 * 60 * 60 * 1000), // 2 hours before deploy
          createdAt: new Date(deployedAt.getTime() - 24 * 60 * 60 * 1000), // 1 day before deploy
        }
      );

      // Create deployment
      const deployment = await seedDeployment(
        ctx,
        application.applicationId,
        environment.environmentId,
        {
          version: `1.0.${deploymentCount}`,
          commitHash: `commit-${deploymentCount}`,
          deployedAt,
          authorId: gitProfile.gitProfileId,
        }
      );

      // Link PR to deployment
      await seedDeploymentPullRequest(
        ctx,
        deployment.deploymentId,
        pr.pullRequestId
      );

      let incidentId: number | undefined;

      // Create incident if this is the Nth deployment
      if (everyNthIncident && deploymentCount % everyNthIncident === 0) {
        const incident = await seedIncident(ctx, deployment.deploymentId, {
          detectedAt: new Date(deployedAt.getTime() + 30 * 60 * 1000), // 30 min after deploy
          resolvedAt: new Date(deployedAt.getTime() + 2 * 60 * 60 * 1000), // 2 hours after deploy
        });
        incidentId = incident.incidentId;
      }

      deployments.push({
        deploymentId: deployment.deploymentId,
        deployedAt,
        pullRequestIds: [pr.pullRequestId],
        incidentId,
      });
    }
  }

  return { deployments };
}

/**
 * Generates a scenario where incidents are tied to deployments
 * and resolved by subsequent deployments.
 */
export async function generateIncidentResolutionTimeline(
  ctx: SeedWorkspace,
  gitProfile: SeedGitProfile,
  application: SeedApplication,
  environment: SeedEnvironment,
  repositoryId: number,
  options: TimelineOptions & {
    /**
     * Number of hours between incident detection and resolution deployment
     */
    resolutionDelayHours?: number;
  }
): Promise<
  TimelineResult & {
    incidents: Array<{ incidentId: number; resolvedByDeploymentId: number }>;
  }
> {
  const timeline = await generateDeploymentTimeline(
    ctx,
    gitProfile,
    application,
    environment,
    repositoryId,
    options
  );

  const incidents: Array<{
    incidentId: number;
    resolvedByDeploymentId: number;
  }> = [];

  // Create incidents for some deployments and resolve them with later deployments
  for (let i = 0; i < timeline.deployments.length; i += 3) {
    const causeDeployment = timeline.deployments[i];
    const resolutionDelayHours = options.resolutionDelayHours ?? 4;

    // Calculate when the incident should be resolved
    const detectedAt = new Date(
      causeDeployment.deployedAt.getTime() + 30 * 60 * 1000 // 30 min after deploy
    );
    const targetResolutionTime = new Date(
      detectedAt.getTime() + resolutionDelayHours * 60 * 60 * 1000
    );

    // Find the next deployment after the target resolution time
    // This might be the next day if deployments are infrequent
    const fixDeployment = timeline.deployments.find(
      (d) => d.deployedAt >= targetResolutionTime
    );

    if (fixDeployment) {
      const incident = await seedIncident(ctx, causeDeployment.deploymentId, {
        detectedAt,
        resolvedAt: fixDeployment.deployedAt,
        fixDeploymentId: fixDeployment.deploymentId,
      });

      incidents.push({
        incidentId: incident.incidentId,
        resolvedByDeploymentId: fixDeployment.deploymentId,
      });
    }
  }

  return { ...timeline, incidents };
}
