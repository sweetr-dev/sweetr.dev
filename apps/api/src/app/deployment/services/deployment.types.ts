interface DateTimeRange {
  from?: string;
  to?: string;
}

export interface PaginateDeploymentsArgs {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  deployedAt?: DateTimeRange;
  limit?: number;
}
