import { BreakdownStage, LeadTimeBreakdown } from "../../../../graphql-types";
import {
  LeadTimeBreakdownResult,
  StageResult,
} from "../../services/lead-time-breakdown.types";

const transformStage = (stage: StageResult): BreakdownStage => {
  return {
    currentAmount: stage.currentAmount,
    previousAmount: stage.previousAmount,
    change: parseFloat(stage.change.toFixed(2)),
  };
};

export const transformLeadTimeBreakdown = (
  breakdown: LeadTimeBreakdownResult
): LeadTimeBreakdown => {
  return {
    codingTime: transformStage(breakdown.codingTime),
    timeToFirstReview: transformStage(breakdown.timeToFirstReview),
    timeToApprove: transformStage(breakdown.timeToApprove),
    timeToMerge: transformStage(breakdown.timeToMerge),
    timeToDeploy: transformStage(breakdown.timeToDeploy),
    currentPeriod: {
      from: breakdown.currentPeriod.from,
      to: breakdown.currentPeriod.to,
    },
    previousPeriod: {
      from: breakdown.previousPeriod.from,
      to: breakdown.previousPeriod.to,
    },
  };
};
