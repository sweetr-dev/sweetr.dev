import { Stepper } from "@mantine/core";
import { BreakdownStage } from "@sweetr/graphql-types/frontend/graphql";
import {
  IconChecks,
  IconCode,
  IconEyeCode,
  IconGitMerge,
  IconRocket,
} from "@tabler/icons-react";
import { Step } from "./step";
import { DateTimeRange } from "../../../../../providers/date.provider";

interface LeadTimeBreakdownProps {
  breakdown: {
    codingTime: BreakdownStage;
    timeToFirstReview: BreakdownStage;
    timeToApprove: BreakdownStage;
    timeToMerge: BreakdownStage;
    timeToDeploy: BreakdownStage;
  };
  previousPeriod?: Partial<DateTimeRange>;
}

export const LeadTimeBreakdown = ({
  breakdown,
  previousPeriod,
}: LeadTimeBreakdownProps) => {
  return (
    <Stepper
      active={-1}
      size="sm"
      color="gray"
      wrap={false}
      styles={{
        step: { cursor: "default" },
        stepIcon: { cursor: "default" },
        stepLabel: { cursor: "default" },
      }}
    >
      <Step
        label="Coding"
        stage={breakdown.codingTime}
        icon={IconCode}
        previousPeriod={previousPeriod}
      />
      <Step
        label="First Review"
        stage={breakdown.timeToFirstReview}
        icon={IconEyeCode}
        previousPeriod={previousPeriod}
      />
      <Step
        label="Approval"
        stage={breakdown.timeToApprove}
        icon={IconChecks}
        previousPeriod={previousPeriod}
      />
      <Step
        label="Merge"
        stage={breakdown.timeToMerge}
        icon={IconGitMerge}
        previousPeriod={previousPeriod}
      />
      <Step
        label="Deploy"
        stage={breakdown.timeToDeploy}
        icon={IconRocket}
        previousPeriod={previousPeriod}
      />
    </Stepper>
  );
};
