interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface PaginateIncidentsArgs {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  detectedAt?: DateTimeRange;
  limit?: number;
}
