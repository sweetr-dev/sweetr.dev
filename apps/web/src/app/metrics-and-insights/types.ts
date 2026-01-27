import { Period } from "@sweetr/graphql-types/frontend/graphql";

export type DoraMetricFilters = {
  from: string | null;
  to: string | null;
  teamIds: string[];
  applicationIds: string[];
  environmentIds: string[];
  period: Period;
};

export type DoraMetricOutletContext = {
  filters: DoraMetricFilters;
  onPeriodChange: (period: Period) => void;
};
