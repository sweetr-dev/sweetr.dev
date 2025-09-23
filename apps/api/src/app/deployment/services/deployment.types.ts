export interface PaginateDeploymentsArgs {
  cursor?: number;
  environmentIds?: number[];
  applicationIds?: number[];
  limit?: number;
}
