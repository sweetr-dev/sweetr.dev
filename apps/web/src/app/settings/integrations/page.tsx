import { SimpleGrid, Skeleton } from "@mantine/core";
import { CardIntegration } from "./components/card-integration";
import { useNavigate } from "react-router-dom";
import { LoadableContent } from "../../../components/loadable-content";
import { PageContainer } from "../../../components/page-container";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { ImageIntegrationLogo } from "./components/image-integration-logo";

export const IntegrationsPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Integrations" }]} />

      <LoadableContent
        isLoading={false}
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
            <CardIntegration
              available={true}
              description="Send notifications to your Slack workspace."
              onClick={() => navigate(`/integrations/slack`)}
              title="Slack"
              enabled={false}
              icon={<ImageIntegrationLogo brand="slack" />}
              color={"dark.6"}
            />
            <CardIntegration
              available={false}
              description="Send notifications to your MS Teams workspace."
              onClick={() => navigate(`/integrations/slack`)}
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
