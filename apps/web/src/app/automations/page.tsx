import { Anchor, SimpleGrid, Skeleton } from "@mantine/core";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { CardAutomation } from "./components/card-automation";
import { Link } from "react-router-dom";
import { PageContainer } from "../../components/page-container";
import { LoadableContent } from "../../components/loadable-content";
import { useAutomationSettings } from "./use-automations";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationCards } from "./use-automation-cards";

export const AutomationsPage = () => {
  const { automationSettings, isLoading } = useAutomationSettings();
  const { automationCards, futureAutomations } = useAutomationCards();

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
            <>
              <Anchor
                key={AutomationType.PR_TITLE_CHECK}
                component={Link}
                to={`/automations/${AutomationType.PR_TITLE_CHECK}`}
                underline="never"
              >
                <CardAutomation
                  {...automationCards.PR_TITLE_CHECK}
                  {...automationSettings?.PR_TITLE_CHECK}
                />
              </Anchor>
            </>
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
