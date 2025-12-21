import { Prisma } from "@prisma/client";
import { Period } from "../../../graphql-types";
import { DateTimeRange } from "../../types";

export interface DoraMetricsFilters {
  workspaceId: number;
  dateRange: Required<DateTimeRange>;
  period: Period;
  teamIds?: number[];
  applicationIds?: number[];
  environmentIds?: number[];
  repositoryIds?: number[];
}

export interface BuildAggregateQuery {
  whereClause: Prisma.Sql;
  from: string;
  to: string;
  isPreviousPeriod: boolean;
}
