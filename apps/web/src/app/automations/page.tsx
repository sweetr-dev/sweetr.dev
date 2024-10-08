import { Anchor, SimpleGrid, Skeleton } from "@mantine/core";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { CardAutomation } from "./components/card-automation";
import { Link, Outlet } from "react-router-dom";
import { PageContainer } from "../../components/page-container";
import { LoadableContent } from "../../components/loadable-content";
import { useAutomationSettings } from "./use-automations";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationCards } from "./use-automation-cards";
import { dash } from "radash";

export const AutomationsPage = () => {
  const { automationSettings, isLoading } = useAutomationSettings();
  const { availableAutomations, futureAutomations } = useAutomationCards();

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
            {availableAutomations.map((automation) => (
              <Anchor
                key={automation.type}
                component={Link}
                to={`/automations/${dash(automation.type)}`}
                underline="never"
              >
                <CardAutomation
                  {...automation}
                  {...automationSettings?.[automation.type as AutomationType]}
                />
              </Anchor>
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
      <Outlet />
    </PageContainer>
  );
};
