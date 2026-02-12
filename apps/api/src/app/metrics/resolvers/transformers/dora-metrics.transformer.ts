import {
  ChangeFailureRateMetric,
  DeploymentFrequencyMetric,
  LeadTimeMetric,
  MeanTimeToRecoverMetric,
} from "../../../../graphql-types";

export const transformLeadTimeMetric = (
  metric: Omit<LeadTimeMetric, "breakdown">
): Omit<LeadTimeMetric, "breakdown"> => {
  return {
    ...metric,
    change: parseFloat(metric.change.toFixed(2)),
    currentPeriod: {
      from: metric.currentPeriod.from,
      to: metric.currentPeriod.to,
    },
    previousPeriod: {
      from: metric.previousPeriod.from,
      to: metric.previousPeriod.to,
    },
  };
};

export const transformChangeFailureRateMetric = (
  metric: Omit<ChangeFailureRateMetric, "breakdown">
): Omit<ChangeFailureRateMetric, "breakdown"> => {
  return {
    ...metric,
    currentAmount: parseFloat(metric.currentAmount.toFixed(2)),
    previousAmount: parseFloat(metric.previousAmount.toFixed(2)),
    change: parseFloat(metric.change.toFixed(2)),
    currentPeriod: {
      from: metric.currentPeriod.from,
      to: metric.currentPeriod.to,
    },
    previousPeriod: {
      from: metric.previousPeriod.from,
      to: metric.previousPeriod.to,
    },
  };
};

export const transformDeploymentFrequencyMetric = (
  metric: Omit<DeploymentFrequencyMetric, "breakdown">
): Omit<DeploymentFrequencyMetric, "breakdown"> => {
  return {
    ...metric,
    avg: parseFloat(metric.avg.toFixed(2)),
    change: parseFloat(metric.change.toFixed(2)),
    currentPeriod: {
      from: metric.currentPeriod.from,
      to: metric.currentPeriod.to,
    },
    previousPeriod: {
      from: metric.previousPeriod.from,
      to: metric.previousPeriod.to,
    },
  };
};

export const transformMeanTimeToRecoverMetric = (
  metric: Omit<MeanTimeToRecoverMetric, "breakdown">
): Omit<MeanTimeToRecoverMetric, "breakdown"> => {
  return {
    ...metric,
    change: parseFloat(metric.change.toFixed(2)),
    currentPeriod: {
      from: metric.currentPeriod.from,
      to: metric.currentPeriod.to,
    },
    previousPeriod: {
      from: metric.previousPeriod.from,
      to: metric.previousPeriod.to,
    },
  };
};
