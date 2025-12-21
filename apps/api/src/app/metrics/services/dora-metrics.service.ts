import { Prisma } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { periodToDateTrunc, periodToInterval } from "./chart.service";
import { BuildAggregateQuery, DoraMetricsFilters } from "./dora-metrics.types";

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
 * Build filter conditions for DORA metrics queries
 */
const buildFilterConditions = (
  filters: DoraMetricsFilters,
  alias: string = "d"
): Prisma.Sql[] => {
  const conditions: Prisma.Sql[] = [];

  // Workspace filter
  conditions.push(
    Prisma.sql`${Prisma.raw(alias)}."workspaceId" = ${filters.workspaceId}`
  );

  // Environment filter - if not provided, filter by production only
  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`${Prisma.raw(alias)}."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    // Join with Environment table to filter by isProduction
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "Environment" e
        WHERE e."id" = ${Prisma.raw(alias)}."environmentId"
        AND e."isProduction" = true
        AND e."archivedAt" IS NULL
      )`
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

  // Team filter - requires join with Application
  if (filters.teamIds && filters.teamIds.length > 0) {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "Application" a
        WHERE a."id" = ${Prisma.raw(alias)}."applicationId"
        AND a."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
        AND a."archivedAt" IS NULL
      )`
    );
  }

  // Repository filter - requires join with Application
  if (filters.repositoryIds && filters.repositoryIds.length > 0) {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "Application" a
        WHERE a."id" = ${Prisma.raw(alias)}."applicationId"
        AND a."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
        AND a."archivedAt" IS NULL
      )`
    );
  }

  return conditions;
};

/**
 * Build lead time aggregate query
 */
const buildLeadTimeAggregateQuery = ({
  whereClause,
  from,
  to,
  isPreviousPeriod = false,
}: BuildAggregateQuery): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  return Prisma.sql`
    SELECT AVG(deployment_lead_times.lead_time_ms) AS value
    FROM (
      SELECT 
        d."id",
        EXTRACT(EPOCH FROM (d."deployedAt" - MIN(pr."createdAt"))) * 1000 AS lead_time_ms
      FROM "Deployment" d
      INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId"
      INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id"
      WHERE ${whereClause}
        AND d."deployedAt" >= ${new Date(from)}
        AND d."deployedAt" ${upperOperator} ${new Date(to)}
        AND d."archivedAt" IS NULL
      GROUP BY d."id", d."deployedAt"
    ) AS deployment_lead_times;
  `;
};

/**
 * Calculate lead time metric
 * Lead time = time from earliest PR creation to deployment
 */
export const getLeadTimeMetric = async (
  filters: DoraMetricsFilters
): Promise<MetricResult> => {
  const { dateRange, period } = filters;
  const { from, to } = dateRange;
  const { beforeFrom, beforeTo } = calculateBeforePeriod(from, to);

  const filterConditions = buildFilterConditions(filters, "d");
  const whereClause = Prisma.join(filterConditions, " AND ");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

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
          EXTRACT(EPOCH FROM (d."deployedAt" - MIN(pr."createdAt"))) * 1000 AS lead_time_ms
        FROM "Deployment" d
        INNER JOIN "DeploymentPullRequest" dpr ON d."id" = dpr."deploymentId"
        INNER JOIN "PullRequest" pr ON dpr."pullRequestId" = pr."id"
        WHERE ${whereClause}
          AND d."deployedAt" >= ${new Date(from)}
          AND d."deployedAt" <= ${new Date(to)}
          AND d."archivedAt" IS NULL
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
    whereClause,
    from,
    to,
    isPreviousPeriod: false,
  });

  const previousAmountQuery = buildLeadTimeAggregateQuery({
    whereClause,
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
 * Build change failure rate aggregate query
 */
const buildChangeFailureRateAggregateQuery = ({
  whereClause,
  from,
  to,
  isPreviousPeriod = false,
}: BuildAggregateQuery): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  return Prisma.sql`
    SELECT ROUND(
      (COUNT(DISTINCT i."id")::numeric / NULLIF(COUNT(DISTINCT d."id"), 0)::numeric) * 100,
      2
    )::double precision AS value
    FROM "Deployment" d
    LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id"
    WHERE ${whereClause}
      AND d."deployedAt" >= ${new Date(from)}
      AND d."deployedAt" ${upperOperator} ${new Date(to)}
      AND d."archivedAt" IS NULL;
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

  const filterConditions = buildFilterConditions(filters, "d");
  const whereClause = Prisma.join(filterConditions, " AND ");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

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
      LEFT JOIN "Incident" i ON i."causeDeploymentId" = d."id"
      WHERE ${whereClause}
        AND d."deployedAt" >= ${new Date(from)}
        AND d."deployedAt" <= ${new Date(to)}
        AND d."archivedAt" IS NULL
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
    whereClause,
    from: from,
    to: to,
    isPreviousPeriod: false,
  });
  const previousAmountQuery = buildChangeFailureRateAggregateQuery({
    whereClause,
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
 * Build deployment frequency aggregate query
 */
const buildDeploymentFrequencyAggregateQuery = ({
  whereClause,
  from,
  to,
  isPreviousPeriod = false,
}: BuildAggregateQuery): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  return Prisma.sql`
    SELECT COUNT(*)::bigint AS value
    FROM "Deployment" d
    WHERE ${whereClause}
      AND d."deployedAt" >= ${new Date(from)}
      AND d."deployedAt" ${upperOperator} ${new Date(to)}
      AND d."archivedAt" IS NULL;
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

  const filterConditions = buildFilterConditions(filters, "d");
  const whereClause = Prisma.join(filterConditions, " AND ");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

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
      WHERE ${whereClause}
        AND d."deployedAt" >= ${new Date(from)}
        AND d."deployedAt" <= ${new Date(to)}
        AND d."archivedAt" IS NULL
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
    whereClause,
    from,
    to,
    isPreviousPeriod: false,
  });

  const previousAmountQuery = buildDeploymentFrequencyAggregateQuery({
    whereClause,
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
 * Build filter conditions for incident queries
 */
const buildIncidentFilterConditions = (
  filters: DoraMetricsFilters
): Prisma.Sql[] => {
  const conditions: Prisma.Sql[] = [];

  // Workspace filter
  conditions.push(Prisma.sql`i."workspaceId" = ${filters.workspaceId}`);

  // Only resolved incidents
  conditions.push(Prisma.sql`i."resolvedAt" IS NOT NULL`);

  // Environment filter - if not provided, filter by production only
  if (filters.environmentIds && filters.environmentIds.length > 0) {
    conditions.push(
      Prisma.sql`cd."environmentId" = ANY(ARRAY[${Prisma.join(
        filters.environmentIds.map((id) => Prisma.sql`${id}`),
        ", "
      )}])`
    );
  } else {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "Environment" e
        WHERE e."id" = cd."environmentId"
        AND e."isProduction" = true
        AND e."archivedAt" IS NULL
      )`
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
  if (filters.teamIds && filters.teamIds.length > 0) {
    conditions.push(
      Prisma.sql`(
        i."teamId" = ANY(ARRAY[${Prisma.join(
          filters.teamIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
        OR EXISTS (
          SELECT 1 FROM "Application" a
          WHERE a."id" = cd."applicationId"
          AND a."teamId" = ANY(ARRAY[${Prisma.join(
            filters.teamIds.map((id) => Prisma.sql`${id}`),
            ", "
          )}])
          AND a."archivedAt" IS NULL
        )
      )`
    );
  }

  // Repository filter - requires join with Application
  if (filters.repositoryIds && filters.repositoryIds.length > 0) {
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM "Application" a
        WHERE a."id" = cd."applicationId"
        AND a."repositoryId" = ANY(ARRAY[${Prisma.join(
          filters.repositoryIds.map((id) => Prisma.sql`${id}`),
          ", "
        )}])
        AND a."archivedAt" IS NULL
      )`
    );
  }

  return conditions;
};

/**
 * Build mean time to recover aggregate query
 */
const buildMeanTimeToRecoverAggregateQuery = ({
  whereClause,
  from,
  to,
  isPreviousPeriod = false,
}: BuildAggregateQuery): Prisma.Sql => {
  const upperOperator = isPreviousPeriod ? Prisma.raw("<") : Prisma.raw("<=");
  return Prisma.sql`
    SELECT AVG(EXTRACT(EPOCH FROM (i."resolvedAt" - i."detectedAt")) * 1000) AS value
    FROM "Incident" i
    INNER JOIN "Deployment" cd ON i."causeDeploymentId" = cd."id"
    WHERE ${whereClause}
      AND i."detectedAt" >= ${new Date(from)}
      AND i."detectedAt" ${upperOperator} ${new Date(to)}
      AND i."archivedAt" IS NULL;
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

  const filterConditions = buildIncidentFilterConditions(filters);
  const whereClause = Prisma.join(filterConditions, " AND ");
  const trunc = periodToDateTrunc(period);
  const interval = periodToInterval(period);

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
      INNER JOIN "Deployment" cd ON i."causeDeploymentId" = cd."id"
      WHERE ${whereClause}
        AND i."detectedAt" >= ${new Date(from)}
        AND i."detectedAt" <= ${new Date(to)}
        AND i."archivedAt" IS NULL
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
    whereClause,
    from,
    to,
    isPreviousPeriod: false,
  });

  const previousAmountQuery = buildMeanTimeToRecoverAggregateQuery({
    whereClause,
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
