import { Anchor, SimpleGrid, Skeleton } from "@mantine/core";
import { CardIntegration } from "./components/card-integration";
import { Link } from "react-router-dom";
import { LoadableContent } from "../../../components/loadable-content";
import { PageContainer } from "../../../components/page-container";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { ImageIntegrationLogo } from "./components/image-integration-logo";
import { useIntegrations } from "./use-integrations";

export const IntegrationsPage = () => {
  const { integrations, isLoading } = useIntegrations();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Integrations" }]} />

      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <Skeleton h={338} />
            <Skeleton h={338} />
            <Skeleton h={338} />
            <Skeleton h={338} />
          </SimpleGrid>
        }
        content={
          <SimpleGrid cols={{ base: 1, md: 3 }}>
            <Anchor
              component={Link}
              to={`/settings/integrations/slack`}
              underline="never"
            >
              <CardIntegration
                available={true}
                description="Send notifications to your Slack workspace."
                title="Slack"
                enabled={integrations?.SLACK?.isEnabled || false}
                icon={<ImageIntegrationLogo brand="slack" />}
                color={"dark.6"}
              />
            </Anchor>
            <CardIntegration
              available={false}
              description="Send notifications to your MS Teams workspace."
              title="MS Teams"
              enabled={false}
              icon={<ImageIntegrationLogo brand="msteams" />}
              color={"dark.6"}
            />
          </SimpleGrid>
        }
      />
    </PageContainer>
  );
};
