import { Period } from "@sweetr/graphql-types/frontend/graphql";

export type PrFlowFilters = {
  from: string | null;
  to: string | null;
  teamIds: string[];
  repositoryIds: string[];
  period: Period;
};
