import { Grid, GridProps, Skeleton } from "@mantine/core";
import { IconCode, IconEyeCode } from "@tabler/icons-react";
import { CardStat } from "./card-stat";
import { usePersonalMetrics } from "../../../../api/personal-metrics.api";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { LoadableContent } from "../../../../components/loadable-content";

export const MyStats = (props: GridProps) => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = usePersonalMetrics({
    workspaceId: workspace.id,
  });

  const metrics = data?.workspace.me?.personalMetrics;

  return (
    <LoadableContent
      isLoading={isLoading}
      whenLoading={
        <Grid {...props}>
          <Grid.Col span={6}>
            <Skeleton h={129} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Skeleton h={129} />
          </Grid.Col>
        </Grid>
      }
      content={
        metrics && (
          <Grid {...props}>
            <Grid.Col span={6}>
              <CardStat
                name="Small or Tiny PRs"
                amount={`${metrics?.pullRequestSize.current}% of merged PRs`}
                change={metrics.pullRequestSize.change}
                previous={metrics.pullRequestSize.previous}
                changePrefix
                icon={IconCode}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <CardStat
                name="Code Review"
                amount={`${metrics?.codeReviewAmount.current} reviews`}
                change={metrics.codeReviewAmount.change}
                previous={metrics.codeReviewAmount.previous}
                icon={IconEyeCode}
              />
            </Grid.Col>
          </Grid>
        )
      }
    />
  );
};
