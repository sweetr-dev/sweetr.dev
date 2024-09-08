import {
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Button,
  Anchor,
  Skeleton,
} from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageTitle } from "../../../components/page-title";
import {
  AutomationBenefit,
  IconAutomationBenefit,
} from "../components/icon-automation-benefit";
import { IconBook2 } from "@tabler/icons-react";
import { PageContainer } from "../../../components/page-container";
import { useWorkspaceAutomationQuery } from "../../../api/automation.api";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useParams } from "react-router-dom";
import { ResourceNotFound } from "../../../exceptions/resource-not-found.exception";
import { AutomationSlug } from "@sweetr/graphql-types/frontend/graphql";
import { LoadableContent } from "../../../components/loadable-content";
import { benefitLabels } from "../../../providers/automation.provider";
import { ImageDemo } from "./components/image-demo";
import { SettingEnabled } from "./components/form-automation-settings";
import { FormAutomationSettings } from "./components/form-automation-settings/form-automation-settings";

export const AutomationPage = () => {
  const { workspace } = useWorkspace();
  const { slug } = useParams<{ slug: AutomationSlug }>();

  if (!slug) throw new ResourceNotFound();

  const { data, isLoading } = useWorkspaceAutomationQuery({
    workspaceId: workspace.id,
    input: { slug },
  });

  const automation = data?.workspace.automation;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Automations", href: "/automations" },
          { label: automation?.title || "" },
        ]}
      />

      <Box maw={650}>
        <LoadableContent
          whenLoading={
            <>
              <Skeleton h={50} />
              <Skeleton h={250} mt={26} />
              <Skeleton h={70} mt="lg" />
              <Skeleton h={70} mt="lg" />
            </>
          }
          isLoading={isLoading}
          content={
            <>
              <PageTitle
                title={
                  <Group gap="xs">
                    <Text fz={32}>{automation?.icon}</Text>
                    <Title mb={0} order={2}>
                      {automation?.title}
                    </Title>
                  </Group>
                }
              >
                {automation?.docsUrl && (
                  <Anchor
                    underline="never"
                    target="_blank"
                    href={automation.docsUrl}
                  >
                    <Button
                      variant="subtle"
                      color="dark.1"
                      leftSection={<IconBook2 stroke={1.5} size={20} />}
                    >
                      Docs
                    </Button>
                  </Anchor>
                )}
              </PageTitle>

              {automation && (
                <ImageDemo title={automation.title} src={automation.demoUrl} />
              )}
              <Text mt="sm">{automation?.description}</Text>
              <Divider my="lg" />
              <Title order={5} mb="sm">
                Setup
              </Title>
              <Stack>
                <Paper withBorder py="sm">
                  {automation && (
                    <FormAutomationSettings automation={automation} />
                  )}
                </Paper>
              </Stack>

              {automation?.benefits && (
                <>
                  <Title order={5} mt="lg" mb="sm">
                    Benefits
                  </Title>
                  <Stack gap="xs">
                    {Object.entries(automation.benefits).map(
                      ([key, value]) =>
                        value && (
                          <Paper withBorder p="sm" key={key}>
                            <Group wrap="nowrap">
                              <IconAutomationBenefit
                                benefit={key as AutomationBenefit}
                                themeIconProps={{
                                  size: "xl",
                                  variant: "light",
                                }}
                                showTooltip={false}
                                iconProps={{ size: "24" }}
                              />
                              <div>
                                <strong>
                                  {benefitLabels[key as AutomationBenefit]}:
                                </strong>{" "}
                                {value}
                              </div>
                            </Group>
                          </Paper>
                        ),
                    )}
                  </Stack>
                </>
              )}
            </>
          }
        />
      </Box>
    </PageContainer>
  );
};
