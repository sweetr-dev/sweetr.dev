import { SimpleGrid, Skeleton } from "@mantine/core";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { CardAutomation } from "./components/card-automation";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../components/page-container";
import { useWorkspace } from "../../providers/workspace.provider";
import { useWorkspaceAutomationsQuery } from "../../api/automation.api";
import { LoadableContent } from "../../components/loadable-content";

const futureAutomations = [
  {
    title: "Label PR Size",
    shortDescription:
      "Automatically label a Pull Request with it's size. Increase awareness on creating small PRs.",
    status: "soon" as const,
    color: "green.1",
    icon: "📏",
    benefits: {
      cycleTime: "1",
      failureRate: "1",
    },
  },
  {
    title: "Notify Stale PRs",
    shortDescription:
      "Send a Slack message when a Pull Request hasn't been reviewed or has been open for too long.",
    status: "soon" as const,
    color: "blue.1",
    icon: "🕵️‍♀️",
    benefits: {
      cycleTime: "1",
    },
  },
  {
    title: "Code Freeze",
    shortDescription:
      "Big migration? Xmas break? Schedule a period where no PRs can be merged in selected repositories.",
    status: "soon" as const,
    color: "blue.1",
    icon: "🧊",
    benefits: {
      failureRate: "1",
    },
  },
  {
    title: "PR Title Requirements",
    shortDescription:
      "Enforce standards on Pull Request titles. Ticket code, specific prefix, or something else? You pick it.",
    status: "soon" as const,
    color: "red.1",
    icon: "✍️",
    benefits: {
      compliance: "1",
    },
  },
];

export const AutomationsPage = () => {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const { data, isLoading } = useWorkspaceAutomationsQuery({
    workspaceId: workspace.id,
  });

  const automations = data?.workspace.automations || [];

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Automations" }]} />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <Skeleton h={334} />
            <Skeleton h={334} />
            <Skeleton h={334} />
            <Skeleton h={334} />
          </SimpleGrid>
        }
        content={
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            {automations.map((automation) => (
              <CardAutomation
                {...automation}
                key={automation.slug}
                available={true}
                description={automation.shortDescription}
                onClick={() => navigate(`/automations/${automation.slug}`)}
              />
            ))}
            {futureAutomations.map((automation) => (
              <CardAutomation
                {...automation}
                key={automation.title}
                available={false}
                enabled={false}
                description={automation.shortDescription}
              />
            ))}
          </SimpleGrid>
        }
      />
    </PageContainer>
  );
};
