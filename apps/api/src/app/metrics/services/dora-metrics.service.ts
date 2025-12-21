import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import { DoraMetricsFilters } from "./dora-metrics.types";

interface MetricResult {
  columns: string[];
  data: bigint[];
  currentAmount: number;
  previousAmount: number;
  change: number;
}

interface DeploymentFrequencyResult extends MetricResult {
  avg: number;
}

/**
 * Calculate the "before" period dates based on exact duration
 */
const calculateBeforePeriod = (
  from: string,
  to: string
): { beforeFrom: string; beforeTo: string } => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const duration = toDate.getTime() - fromDate.getTime();
  const beforeTo = fromDate;
  const beforeFrom = new Date(beforeTo.getTime() - duration);

  return {
    beforeFrom: beforeFrom.toISOString(),
    beforeTo: beforeTo.toISOString(),
  };
};

/**
 * Build filter joins and conditions for DORA metrics queries using optimized JOINs
 */
const buildDeploymentFilters = (
  filters: DoraMetricsFilters,
  alias: string = "d"
): { joins: Prisma.Sql[]; conditions: Prisma.Sql[] } => {
  const joins: Prisma.Sql[] = [];
  const conditions: Prisma.Sql[] = [];

  // Workspace filter
  conditions.push(
    Prisma.sql`${Prisma.raw(alias)}."workspaceId" = ${filters.workspaceId}`
  );

  // Environment filter - use JOIN for production filter
  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    // Join with Environment table to filter by isProduction
    joins.push(
      Prisma.sql`INNER JOIN "Environment" e ON e."id" = ${Prisma.raw(alias)}."environmentId" AND e."workspaceId" = ${Prisma.raw(alias)}."workspaceId"`
    );
    conditions.push(
      Prisma.sql`e."isProduction" = true AND e."archivedAt" IS NULL`
    );
  }

  // Application filter
  if (filters.applicationIds && filters.applicationIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."applicationId" = ANY(ARRAY[${Prisma.join(
        filters.applicationIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  // Team or Repository filter - use single JOIN for Application
  const needsApplicationJoin =
    (filters.teamIds && filters.teamIds.length > 0) ||
    (filters.repositoryIds && filters.repositoryIds.length > 0);

  if (needsApplicationJoin) {
    joins.push(
      Prisma.sql`INNER JOIN "Application" a ON a."id" = ${Prisma.raw(alias)}."applicationId" AND a."workspaceId" = ${Prisma.raw(alias)}."workspaceId" AND a."archivedAt" IS NULL`
    );

    if (filters.teamIds && filters.teamIds.length > 0) {
      conditions.push(
        Prisma.sql`a."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      );
    }

    if (filters.repositoryIds && filters.repositoryIds.length > 0) {
      conditions.push(
        Prisma.sql`a."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      );
    }
  }

  return { joins, conditions };
};

/**
 * Build lead time aggregate query with optimized JOINs
 */
const buildLeadTimeAggregateQuery = ({
  filters,
  from,
  to,
  isPreviousPeriod = false,
}: {
  filters: DoraMetricsFilters;
  from: string;
  to: string;
  isPreviousPeriod?: boolean;
}): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  const { joins, conditions } = buildDeploymentFilters(filters, "d");

  const allJoins = [
    ...joins,
    Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId"`,
    Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id"`,
    Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId"`,
  ];

  conditions.push(
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" ${upperOperator} ${new Date(to)}`,
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

/**
 * Calculate lead time metric
 * Lead time = time from earliest PR first commit to deployment
 */
export const getLeadTimeMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const { beforeFrom, beforeTo } = calculateBeforePeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const allJoins = [
    ...joins,
    Prisma.sql`INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId"`,
    Prisma.sql`INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id"`,
    Prisma.sql`LEFT JOIN "PullRequestTracking" prt ON pr."id" = prt."pullRequestId"`,
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

  const currentAmountQuery = buildLeadTimeAggregateQuery({
    filters,
    from,
    to,
    isPreviousPeriod: false,
  });

  const previousAmountQuery = buildLeadTimeAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
    isPreviousPeriod: true,
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
    currentAmount,
    previousAmount,
    change,
  };
};

/**
 * Build change failure rate aggregate query with optimized JOINs
 */
const buildChangeFailureRateAggregateQuery = ({
  filters,
  from,
  to,
  isPreviousPeriod = false,
}: {
  filters: DoraMetricsFilters;
  from: string;
  to: string;
  isPreviousPeriod?: boolean;
}): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  const { joins, conditions } = buildDeploymentFilters(filters, "d");

  const allJoins = [
    ...joins,
    Prisma.sql`LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id"`,
  ];

  conditions.push(
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" ${upperOperator} ${new Date(to)}`,
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

/**
 * Calculate change failure rate metric
 * Change failure rate = (incidents / deployments) * 100
 */
export const getChangeFailureRateMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const { beforeFrom, beforeTo } = calculateBeforePeriod(from, to);

  const { joins, conditions } = buildDeploymentFilters(filters, "d");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

  const allJoins = [
    ...joins,
    Prisma.sql`LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id"`,
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

  const currentAmountQuery = buildChangeFailureRateAggregateQuery({
    filters,
    from: from,
    to: to,
    isPreviousPeriod: false,
  });
  const previousAmountQuery = buildChangeFailureRateAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
    isPreviousPeriod: true,
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

  const currentAmount = amountResult[0]?.value || 0;
  const previousAmount = beforeResult[0]?.value || 0;
  const change =
    previousAmount !== 0
      ? ((currentAmount - previousAmount) / previousAmount) * 100
      : 0;

  return {
    columns,
    data,
    currentAmount,
    previousAmount,
    change,
  };
};

/**
 * Build deployment frequency aggregate query with optimized JOINs
 */
const buildDeploymentFrequencyAggregateQuery = ({
  filters,
  from,
  to,
  isPreviousPeriod = false,
}: {
  filters: DoraMetricsFilters;
  from: string;
  to: string;
  isPreviousPeriod?: boolean;
}): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  const { joins, conditions } = buildDeploymentFilters(filters, "d");

  conditions.push(
    Prisma.sql`d."deployedAt" >= ${new Date(from)}`,
    Prisma.sql`d."deployedAt" ${upperOperator} ${new Date(to)}`,
    Prisma.sql`d."archivedAt" IS NULL`
  );

  const whereClause = Prisma.join(conditions, " AND ");
  const joinClause = joins.length > 0 ? Prisma.join(joins, " ") : Prisma.sql``;

  return Prisma.sql`
    SELECT COUNT(*)::bigint AS value
    FROM "Deployment" d
    ${joinClause}
    WHERE ${whereClause};
  `;
};

/**
 * Calculate deployment frequency metric
 * Deployment frequency = count of deployments per period
 */
export const getDeploymentFrequencyMetric = async (
  filters: DoraMetricsFilters
): Promise<DeploymentFrequencyResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const { beforeFrom, beforeTo } = calculateBeforePeriod(from, to);

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

  const currentAmountQuery = buildDeploymentFrequencyAggregateQuery({
    filters,
    from,
    to,
    isPreviousPeriod: false,
  });

  const previousAmountQuery = buildDeploymentFrequencyAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
    isPreviousPeriod: true,
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

  // Calculate average deployments per day for current period
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
    currentAmount,
    previousAmount,
    change,
    avg,
  };
};

/**
 * Build filter joins and conditions for incident queries using optimized JOINs
 */
const buildIncidentFilters = (
  filters: DoraMetricsFilters
): { joins: Prisma.Sql[]; conditions: Prisma.Sql[] } => {
  const joins: Prisma.Sql[] = [];
  const conditions: Prisma.Sql[] = [];

  // Workspace filter
  conditions.push(Prisma.sql`i."workspaceId" = ${filters.workspaceId}`);

  // Only resolved incidents
  conditions.push(Prisma.sql`i."resolvedAt" IS NOT NULL`);

  // Always join with Deployment (causeDeployment)
  joins.push(
    Prisma.sql`INNER JOIN "Deployment" cd ON i."causeDeploymentId" = cd."id" AND cd."workspaceId" = i."workspaceId"`
  );

  // Environment filter - use JOIN for production filter
  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    // Join with Environment table to filter by isProduction
    joins.push(
      Prisma.sql`INNER JOIN "Environment" e ON e."id" = cd."environmentId" AND e."workspaceId" = cd."workspaceId"`
    );
    conditions.push(
      Prisma.sql`e."isProduction" = true AND e."archivedAt" IS NULL`
    );
  }

  // Application filter
  if (filters.applicationIds && filters.applicationIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."applicationId" = ANY(ARRAY[${Prisma.join(
        filters.applicationIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  // Team filter - can be via incident.teamId or application.teamId
  const needsApplicationJoin =
    (filters.teamIds && filters.teamIds.length > 0) ||
    (filters.repositoryIds && filters.repositoryIds.length > 0);

  if (needsApplicationJoin) {
    joins.push(
      Prisma.sql`INNER JOIN "Application" a ON a."id" = cd."applicationId" AND a."workspaceId" = cd."workspaceId" AND a."archivedAt" IS NULL`
    );

    if (filters.teamIds && filters.teamIds.length > 0) {
      conditions.push(
        Prisma.sql`(
          i."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
          OR a."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
        )`
      );
    }

    if (filters.repositoryIds && filters.repositoryIds.length > 0) {
      conditions.push(
        Prisma.sql`a."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])`
      );
    }
  } else if (filters.teamIds && filters.teamIds.length > 0) {
    // Only team filter via incident.teamId, no Application join needed
    conditions.push(
      Prisma.sql`i."teamId" = ANY(ARRAY[${Prisma.join(
        filters.teamIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  }

  return { joins, conditions };
};

/**
 * Build mean time to recover aggregate query with optimized JOINs
 */
const buildMeanTimeToRecoverAggregateQuery = ({
  filters,
  from,
  to,
  isPreviousPeriod = false,
}: {
  filters: DoraMetricsFilters;
  from: string;
  to: string;
  isPreviousPeriod?: boolean;
}): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  const { joins, conditions } = buildIncidentFilters(filters);

  conditions.push(
    Prisma.sql`i."detectedAt" >= ${new Date(from)}`,
    Prisma.sql`i."detectedAt" ${upperOperator} ${new Date(to)}`,
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

/**
 * Calculate mean time to recover metric
 * MTTR = average time from incident detection to resolution
 */
export const getMeanTimeToRecoverMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const { beforeFrom, beforeTo } = calculateBeforePeriod(from, to);

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

  const currentAmountQuery = buildMeanTimeToRecoverAggregateQuery({
    filters,
    from,
    to,
    isPreviousPeriod: false,
  });

  const previousAmountQuery = buildMeanTimeToRecoverAggregateQuery({
    filters,
    from: beforeFrom,
    to: beforeTo,
    isPreviousPeriod: true,
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
    currentAmount,
    previousAmount,
    change,
  };
};
