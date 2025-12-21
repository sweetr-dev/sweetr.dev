import {
  LeadTimeMetric,
  ChangeFailureRateMetric,
  DeploymentFrequencyMetric,
  MeanTimeToRecoverMetric,
} from "../../../../graphql-types";

export const transformLeadTimeMetric = (
  metric: LeadTimeMetric
): LeadTimeMetric => {
  return {
    ...metric,
    change: parseFloat(metric.change.toFixed(2)),
  };
};

export const transformChangeFailureRateMetric = (
  metric: ChangeFailureRateMetric
): ChangeFailureRateMetric => {
  return {
    ...metric,
    currentAmount: parseFloat(metric.currentAmount.toFixed(2)),
    previousAmount: parseFloat(metric.previousAmount.toFixed(2)),
    change: parseFloat(metric.change.toFixed(1)),
  };
};

export const transformDeploymentFrequencyMetric = (
  metric: DeploymentFrequencyMetric
): DeploymentFrequencyMetric => {
  return {
    ...metric,
    avg: parseFloat(metric.avg.toFixed(2)),
    change: parseFloat(metric.change.toFixed(2)),
  };
};

export const transformMeanTimeToRecoverMetric = (
  metric: MeanTimeToRecoverMetric
): MeanTimeToRecoverMetric => {
  return {
    ...metric,
    change: parseFloat(metric.change.toFixed(2)),
  };
};
