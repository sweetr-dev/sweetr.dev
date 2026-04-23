import { Prisma } from "@prisma/client";
import { getPreviousPeriod } from "../../../lib/date";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import {
  AggregateQueryArgs,
  DeploymentFiltersResult,
  DeploymentFrequencyResult,
  DoraMetricsFilters,
  DoraTeamOverviewSqlRow,
  FailureRateResult,
  MetricResult,
} from "./dora-metrics.types";

export const getLeadTimeMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const allJoins = [
    ...joins,
    Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId" AND dpr."workspaceId" = d."workspaceId"`,
    Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id" AND pr."workspaceId" = d."workspaceId"`,
    Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId" AND prt."workspaceId" = d."workspaceId"`,
  ];

  const chartConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause = Prisma.join(allJoins, " ");

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, deployment_lead_times."deployedAt") AS period,
        AVG(deployment_lead_times.lead_time_ms) AS value
      FROM (
        SELECT 
          d."id",
          d."deployedAt",
          EXTRACT(EPOCH FROM (d."deployedAt" - MIN(COALESCE(prt."firstCommitAt", pr."createdAt")))) * 1000 AS lead_time_ms
        FROM "Deployment" d
        ${chartJoinClause}
        WHERE ${chartWhereClause}
        GROUP BY d."id", d."deployedAt"
      ) AS deployment_lead_times
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const buildAmountQuery = ({
    filters,
    from,
    to,
  }: AggregateQueryArgs): Prisma.Sql => {
    const { joins, conditions } = buildDeploymentFilters(filters, "d");

    const allJoins = [
      ...joins,
      Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId" AND dpr."workspaceId" = d."workspaceId"`,
      Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id" AND pr."workspaceId" = d."workspaceId"`,
      Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId" AND prt."workspaceId" = d."workspaceId"`,
    ];

    conditions.push(
      Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
      Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
      Prisma.sql`d."archivedAt" IS NULL`
    );

    const whereClause = Prisma.join(conditions, " AND ");
    const joinClause = Prisma.join(allJoins, " ");

    return Prisma.sql`
    SELECT AVG(deployment_lead_times.lead_time_ms) AS value
    FROM (
      SELECT 
        d."id",
        EXTRACT(EPOCH FROM (d."deployedAt" - MIN(COALESCE(prt."firstCommitAt", pr."createdAt")))) * 1000 AS lead_time_ms
      FROM "Deployment" d
      ${joinClause}
      WHERE ${whereClause}
      GROUP BY d."id", d."deployedAt"
    ) AS deployment_lead_times;
  `;
  };

  const currentAmountQuery = buildAmountQuery({
    filters,
    from,
    to,
  });

  const previousAmountQuery = buildAmountQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<{ period: Date; value: number }[]>(
      chartQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => BigInt(Math.floor(r.value || 0)));

  const currentAmount = amountResult[0]?.value
    ? Math.floor(amountResult[0].value)
    : 0;
  const previousAmount = beforeResult[0]?.value
    ? Math.floor(beforeResult[0].value)
    : 0;
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  return {
    columns,
    data,
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

const buildDeploymentFilters = (
  filters: DoraMetricsFilters,
  alias: string = "d"
): DeploymentFiltersResult => {
  const joins: Prisma.Sql[] = [];
  const conditions: Prisma.Sql[] = [];

  conditions.push(
    Prisma.sql`${Prisma.raw(alias)}."workspaceId" = ${filters.workspaceId}`
  );

  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    joins.push(
      Prisma.sql`INNER JOIN "Environment" e ON e."id" = ${Prisma.raw(alias)}."environmentId" AND e."workspaceId" = ${Prisma.raw(alias)}."workspaceId"`
    );
    conditions.push(
      Prisma.sql`e."isProduction" = true AND e."archivedAt" IS NULL`
    );
  }

  if (filters.applicationIds && filters.applicationIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."applicationId" = ANY(ARRAY[${Prisma.join(
        filters.applicationIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  if (filters.repositoryIds && filters.repositoryIds.length > 0) {
    joins.push(
      Prisma.sql`INNER JOIN "Application" a ON a."id" = ${Prisma.raw(alias)}."applicationId" AND a."workspaceId" = ${Prisma.raw(alias)}."workspaceId" AND a."archivedAt" IS NULL`
    );
    conditions.push(
      Prisma.sql`a."repositoryId" = ANY(ARRAY[${Prisma.join(
        filters.repositoryIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  if (filters.teamIds && filters.teamIds.length > 0) {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "TeamMember" tm
        WHERE tm."gitProfileId" = ${Prisma.raw(alias)}."authorId"
        AND tm."workspaceId" = ${Prisma.raw(alias)}."workspaceId"
        AND tm."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
      )`
    );
  }

  return { joins, conditions };
};

export const getChangeFailureRateMetric = async (
  filters: DoraMetricsFilters
): Promise<FailureRateResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const allJoins = [
    ...joins,
    Prisma.sql`LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id" AND i."workspaceId" = d."workspaceId" AND i."archivedAt" IS NULL`,
  ];

  const chartConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause = Prisma.join(allJoins, " ");

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, d."deployedAt") AS period,
        ROUND(
          (COUNT(DISTINCT i."id")::numeric / NULLIF(COUNT(DISTINCT d."id"), 0)::numeric) * 100,
          2
        )::double precision AS value
      FROM "Deployment" d
      ${chartJoinClause}
      WHERE ${chartWhereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const buildAmountQuery = ({
    filters,
    from,
    to,
  }: AggregateQueryArgs): Prisma.Sql => {
    const { joins, conditions } = buildDeploymentFilters(filters, "d");

    const allJoins = [
      ...joins,
      Prisma.sql`LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id" AND i."workspaceId" = d."workspaceId" AND i."archivedAt" IS NULL`,
    ];

    conditions.push(
      Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
      Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
      Prisma.sql`d."archivedAt" IS NULL`
    );

    const whereClause = Prisma.join(conditions, " AND ");
    const joinClause = Prisma.join(allJoins, " ");

    return Prisma.sql`
    SELECT ROUND(
      (COUNT(DISTINCT i."id")::numeric / NULLIF(COUNT(DISTINCT d."id"), 0)::numeric) * 100,
      2
    )::double precision AS value
    FROM "Deployment" d
    ${joinClause}
    WHERE ${whereClause};
  `;
  };

  const currentAmountQuery = buildAmountQuery({
    filters,
    from,
    to,
  });
  const previousAmountQuery = buildAmountQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<
      { period: Date; value: number | null }[]
    >(chartQuery),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => parseFloat(r.value?.toFixed(2) || "0"));

  const currentAmount = amountResult[0]?.value || 0;
  const previousAmount = beforeResult[0]?.value || 0;

  // Failure rate is already a percentage, so use the difference in percentage points
  const change = currentAmount - previousAmount;

  return {
    columns,
    data,
    currentAmount,
    previousAmount,
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

export const getDeploymentFrequencyMetric = async (
  filters: DoraMetricsFilters
): Promise<DeploymentFrequencyResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const chartConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause =
    joins.length > 0 ? Prisma.join(joins, " ") : Prisma.sql``;

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, d."deployedAt") AS period,
        COUNT(*)::bigint AS value
      FROM "Deployment" d
      ${chartJoinClause}
      WHERE ${chartWhereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const buildAmountQuery = ({
    filters,
    from,
    to,
  }: AggregateQueryArgs): Prisma.Sql => {
    const { joins, conditions } = buildDeploymentFilters(filters, "d");

    conditions.push(
      Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
      Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
      Prisma.sql`d."archivedAt" IS NULL`
    );

    const whereClause = Prisma.join(conditions, " AND ");
    const joinClause =
      joins.length > 0 ? Prisma.join(joins, " ") : Prisma.sql``;

    return Prisma.sql`
    SELECT COUNT(*)::bigint AS value
    FROM "Deployment" d
    ${joinClause}
    WHERE ${whereClause};
  `;
  };

  const currentAmountQuery = buildAmountQuery({
    filters,
    from,
    to,
  });

  const previousAmountQuery = buildAmountQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<{ period: Date; value: bigint }[]>(
      chartQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: bigint }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: bigint }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => BigInt(r.value || 0));

  const currentAmount = Number(amountResult[0]?.value || 0);
  const previousAmount = Number(beforeResult[0]?.value || 0);
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  const daysDiff = Math.max(
    1,
    Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avg = currentAmount / daysDiff;

  return {
    columns,
    data,
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    avg,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

const buildIncidentFilters = (
  filters: DoraMetricsFilters
): DeploymentFiltersResult => {
  const joins: Prisma.Sql[] = [];
  const conditions: Prisma.Sql[] = [];

  conditions.push(Prisma.sql`i."workspaceId" = ${filters.workspaceId}`);
  conditions.push(Prisma.sql`i."resolvedAt" IS NOT NULL`);

  joins.push(
    Prisma.sql`INNER JOIN "Deployment" cd ON i."causeDeploymentId" = cd."id" AND cd."workspaceId" = i."workspaceId" AND cd."archivedAt" IS NULL`
  );

  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    joins.push(
      Prisma.sql`INNER JOIN "Environment" e ON e."id" = cd."environmentId" AND e."workspaceId" = cd."workspaceId"`
    );
    conditions.push(
      Prisma.sql`e."isProduction" = true AND e."archivedAt" IS NULL`
    );
  }

  if (filters.applicationIds && filters.applicationIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."applicationId" = ANY(ARRAY[${Prisma.join(
        filters.applicationIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  if (filters.repositoryIds && filters.repositoryIds.length > 0) {
    joins.push(
      Prisma.sql`INNER JOIN "Application" a ON a."id" = cd."applicationId" AND a."workspaceId" = cd."workspaceId" AND a."archivedAt" IS NULL`
    );
    conditions.push(
      Prisma.sql`a."repositoryId" = ANY(ARRAY[${Prisma.join(
        filters.repositoryIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  if (filters.teamIds && filters.teamIds.length > 0) {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "TeamMember" tm
        WHERE tm."gitProfileId" = cd."authorId"
        AND tm."workspaceId" = cd."workspaceId"
        AND tm."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
      )`
    );
  }

  return { joins, conditions };
};

export const getMeanTimeToRecoverMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const [beforeFrom, beforeTo] = getPreviousPeriod(from, to);

  const { joins, conditions } = buildIncidentFilters(filters);
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const chartConditions = [
    ...conditions,
    Prisma.sql`i."detectedAt" >= ${new Date(from)}`,
    Prisma.sql`i."detectedAt" <= ${new Date(to)}`,
    Prisma.sql`i."archivedAt" IS NULL`,
  ];

  const chartWhereClause = Prisma.join(chartConditions, " AND ");
  const chartJoinClause = Prisma.join(joins, " ");

  const chartQuery = Prisma.sql`
    WITH periods AS (
      SELECT generate_series(
        DATE_TRUNC(${trunc}, ${new Date(from)}::timestamp),
        DATE_TRUNC(${trunc}, ${new Date(to)}::timestamp),
        ${interval}::interval
      ) AS period
    ),
    data AS (
      SELECT 
        DATE_TRUNC(${trunc}, i."detectedAt") AS period,
        AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) * 1000) AS value
      FROM "Incident" i
      ${chartJoinClause}
      WHERE ${chartWhereClause}
      GROUP BY period
    )
    SELECT
      periods.period,
      COALESCE(data.value, 0) AS value
    FROM periods
    LEFT JOIN data ON periods.period = data.period
    ORDER BY periods.period ASC;
  `;

  const buildAmountQuery = ({
    filters,
    from,
    to,
  }: AggregateQueryArgs): Prisma.Sql => {
    const { joins, conditions } = buildIncidentFilters(filters);

    conditions.push(
      Prisma.sql`i."detectedAt" >= ${new Date(from)}`,
      Prisma.sql`i."detectedAt" <= ${new Date(to)}`,
      Prisma.sql`i."archivedAt" IS NULL`
    );

    const whereClause = Prisma.join(conditions, " AND ");
    const joinClause = Prisma.join(joins, " ");

    return Prisma.sql`
    SELECT AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) * 1000) AS value
    FROM "Incident" i
    ${joinClause}
    WHERE ${whereClause};
  `;
  };

  const currentAmountQuery = buildAmountQuery({
    filters,
    from,
    to,
  });

  const previousAmountQuery = buildAmountQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
  });

  const [chartResults, amountResult, beforeResult] = await Promise.all([
    getPrisma(filters.workspaceId).$queryRaw<
      { period: Date; value: number | null }[]
    >(chartQuery),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      currentAmountQuery
    ),
    getPrisma(filters.workspaceId).$queryRaw<{ value: number | null }[]>(
      previousAmountQuery
    ),
  ]);

  const columns = chartResults.map((r) => r.period.toISOString());
  const data = chartResults.map((r) => BigInt(Math.floor(r.value || 0)));

  const currentAmount = amountResult[0]?.value
    ? Math.floor(amountResult[0].value)
    : 0;
  const previousAmount = beforeResult[0]?.value
    ? Math.floor(beforeResult[0].value)
    : 0;
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  return {
    columns,
    data,
    currentAmount: BigInt(currentAmount),
    previousAmount: BigInt(previousAmount),
    change,
    currentPeriod: { from, to },
    previousPeriod: { from: beforeFrom, to: beforeTo },
  };
};

export const getDoraTeamOverview = async (filters: DoraMetricsFilters) => {
  const { from, to } = filters.dateRange;
  const workspaceId = filters.workspaceId;

  const baseFilters: DoraMetricsFilters = {
    ...filters,
    teamIds: undefined,
  };

  const { joins, conditions } = buildDeploymentFilters(baseFilters, "d");

  const deployConditions = [
    ...conditions,
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" <= ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`,
  ];
  const deployWhereClause = Prisma.join(deployConditions, " AND ");
  const deployJoinClause =
    joins.length > 0 ? Prisma.join(joins, " ") : Prisma.sql``;

  const teamListFilter =
    filters.teamIds && filters.teamIds.length > 0
      ? Prisma.sql`AND t."id" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      : Prisma.empty;

  const leadExtraJoins = [
    Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId" AND dpr."workspaceId" = d."workspaceId"`,
    Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id" AND pr."workspaceId" = d."workspaceId"`,
    Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId" AND prt."workspaceId" = d."workspaceId"`,
  ];
  const leadJoinClause = Prisma.join([...joins, ...leadExtraJoins], " ");

  // Every metric is computed against the same cohort: the deployments that
  // fall inside the date range after all deployment filters are applied.
  // CFR and MTTR attribute incidents via `causeDeploymentId` against that
  // cohort — they do NOT re-filter incidents by their own detection date.
  const query = Prisma.sql`
    WITH all_teams AS (
      SELECT t."id", t."name", t."icon"
      FROM "Team" t
      WHERE t."workspaceId" = ${workspaceId}
        AND t."archivedAt" IS NULL
        ${teamListFilter}
    ),
    deployments_scoped AS (
      SELECT d."id", d."authorId"
      FROM "Deployment" d
      ${deployJoinClause}
      WHERE ${deployWhereClause}
    ),
    deployment_lead_times AS (
      SELECT
        d."id",
        EXTRACT(EPOCH FROM (d."deployedAt" - MIN(COALESCE(prt."firstCommitAt", pr."createdAt")))) * 1000 AS lead_time_ms
      FROM "Deployment" d
      ${leadJoinClause}
      WHERE ${deployWhereClause}
      GROUP BY d."id", d."deployedAt"
    ),
    team_deployments AS (
      SELECT tm."teamId" AS team_id, ds."id" AS deployment_id
      FROM deployments_scoped ds
      INNER JOIN "TeamMember" tm ON tm."gitProfileId" = ds."authorId" AND tm."workspaceId" = ${workspaceId}
    ),
    team_lead AS (
      SELECT td.team_id, AVG(dlt.lead_time_ms) AS avg_lead_ms
      FROM team_deployments td
      LEFT JOIN deployment_lead_times dlt ON dlt."id" = td.deployment_id
      GROUP BY td.team_id
    ),
    team_deploy_count AS (
      SELECT team_id, COUNT(DISTINCT deployment_id)::bigint AS deployment_count
      FROM team_deployments
      GROUP BY team_id
    ),
    team_cfr AS (
      SELECT
        td.team_id,
        ROUND(
          (COUNT(DISTINCT i."id")::numeric / NULLIF(COUNT(DISTINCT td.deployment_id), 0)::numeric) * 100,
          2
        )::double precision AS change_failure_rate
      FROM team_deployments td
      LEFT JOIN "Incident" i
        ON i."causeDeploymentId" = td.deployment_id
        AND i."workspaceId" = ${workspaceId}
        AND i."archivedAt" IS NULL
      GROUP BY td.team_id
    ),
    team_mttr AS (
      SELECT
        td.team_id,
        AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) * 1000) AS avg_mttr_ms
      FROM team_deployments td
      INNER JOIN "Incident" i
        ON i."causeDeploymentId" = td.deployment_id
        AND i."workspaceId" = ${workspaceId}
        AND i."archivedAt" IS NULL
        AND i."resolvedAt" IS NOT NULL
      GROUP BY td.team_id
    )
    SELECT
      at."id" AS team_id,
      at."name" AS team_name,
      at."icon" AS team_icon,
      tl.avg_lead_ms,
      COALESCE(tdc.deployment_count, 0)::bigint AS deployment_count,
      COALESCE(tcfr.change_failure_rate, 0) AS change_failure_rate,
      tm.avg_mttr_ms
    FROM all_teams at
    LEFT JOIN team_lead tl ON tl.team_id = at."id"
    LEFT JOIN team_deploy_count tdc ON tdc.team_id = at."id"
    LEFT JOIN team_cfr tcfr ON tcfr.team_id = at."id"
    LEFT JOIN team_mttr tm ON tm.team_id = at."id"
    ORDER BY at."name" ASC;
  `;

  const rows =
    await getPrisma(workspaceId).$queryRaw<DoraTeamOverviewSqlRow[]>(query);

  return rows.map((r) => ({
    teamId: r.team_id,
    teamName: r.team_name,
    teamIcon: r.team_icon,
    leadTimeMs:
      r.avg_lead_ms != null ? BigInt(Math.floor(Number(r.avg_lead_ms))) : null,
    deploymentCount: Number(r.deployment_count),
    changeFailureRate: Number(r.change_failure_rate) || 0,
    meanTimeToRecoverMs:
      r.avg_mttr_ms != null ? BigInt(Math.floor(Number(r.avg_mttr_ms))) : null,
  }));
};
