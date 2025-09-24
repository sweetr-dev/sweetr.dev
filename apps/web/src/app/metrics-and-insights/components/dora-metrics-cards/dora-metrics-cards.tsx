import { Grid, GridProps } from "@mantine/core";
import {
  IconClock,
  IconFireExtinguisher,
  IconFlame,
} from "@tabler/icons-react";
import { DoraCardStat } from "./dora-card-stat";
import { IconDeployment } from "../../../../providers/icon.provider";

interface DoraMetricsCardsProps extends GridProps {
  data: {
    frequency: {
      current: string;
      previous: string;
      change: number;
    };
    leadTime: {
      current: string;
      change: number;
    };
    failureRate: {
      current: string;
      change: number;
    };
    mttr: {
      current: string;
      change: number;
    };
  };
}

export const DoraMetricsCards = ({ data, ...props }: DoraMetricsCardsProps) => {
  return (
    <Grid {...props}>
      <Grid.Col span={3}>
        <DoraCardStat
          name="Frequency"
          amount={data.frequency.current}
          change={data.frequency.change}
          icon={IconDeployment}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <DoraCardStat
          name="Lead time"
          amount={data.leadTime.current}
          change={data.leadTime.change}
          icon={IconClock}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <DoraCardStat
          name="Failure rate"
          amount={data.failureRate.current}
          change={data.failureRate.change}
          icon={IconFlame}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <DoraCardStat
          name="MTTR"
          amount={data.mttr.current}
          change={data.mttr.change}
          icon={IconFireExtinguisher}
        />
      </Grid.Col>
    </Grid>
  );
};
