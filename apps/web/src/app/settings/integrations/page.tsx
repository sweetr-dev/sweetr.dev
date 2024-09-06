import { SimpleGrid, Skeleton } from "@mantine/core";
import { CardIntegration } from "./components/card-integration";
import { useNavigate } from "react-router-dom";
import { LoadableContent } from "../../../components/loadable-content";
import { PageContainer } from "../../../components/page-container";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { ImageIntegrationLogo } from "./components/image-integration-logo";
import { useIntegrations } from "./use-integrations";

export const IntegrationsPage = () => {
  const navigate = useNavigate();

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
            <CardIntegration
              available={true}
              description="Send notifications to your Slack workspace."
              onClick={() => navigate(`/settings/integrations/slack`)}
              title="Slack"
              enabled={integrations?.SLACK?.isEnabled || false}
              icon={<ImageIntegrationLogo brand="slack" />}
              color={"dark.6"}
            />
            <CardIntegration
              available={false}
              description="Send notifications to your MS Teams workspace."
              onClick={() => navigate(`/settings/integrations/slack`)}
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
