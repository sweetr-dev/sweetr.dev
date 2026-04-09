import { Divider, Title, NavLink, Badge } from "@mantine/core";
import {
  IconBrain,
  IconChartBar,
  IconChartPie2,
  IconGitPullRequest,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router";
import { Subnav } from "../../../../components/subnav";

export const SubnavMetrics = () => {
  const { pathname } = useLocation();

  return (
    <Subnav>
      <Title order={3} mt={34}>
        Metrics
      </Title>
      <Divider label="Dashboards" labelPosition="left" mt="sm" />
      <NavLink
        to="/metrics-and-insights/dora"
        active={pathname.startsWith("/metrics-and-insights/dora")}
        component={Link}
        label="DORA"
        leftSection={<IconChartBar stroke={1.5} size={18} />}
      />
      <NavLink
        to="/metrics-and-insights/pr-flow"
        active={pathname.startsWith("/metrics-and-insights/pr-flow")}
        component={Link}
        label="PR Flow"
        leftSection={<IconGitPullRequest stroke={1.5} size={18} />}
      />
      <NavLink
        to="/metrics-and-insights/ai-adoption"
        active={pathname.startsWith("/metrics-and-insights/ai-adoption")}
        component={Link}
        label="Work Allocation"
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
        leftSection={<IconChartPie2 stroke={1.5} size={18} />}
      />
      <NavLink
        to="/metrics-and-insights/ai-adoption"
        active={pathname.startsWith("/metrics-and-insights/ai-adoption")}
        component={Link}
        label="AI Adoption"
        disabled
        rightSection={
          <Badge size="xs" variant="default">
            Soon
          </Badge>
        }
        leftSection={<IconBrain stroke={1.5} size={18} />}
      />
    </Subnav>
  );
};
