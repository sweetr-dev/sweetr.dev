import {
  Image,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Switch,
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
import {
  useUpdateAutomationMutation,
  useWorkspaceAutomationQuery,
} from "../../../api/automation.api";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useParams } from "react-router-dom";
import { ResourceNotFound } from "../../../exceptions/resource-not-found.exception";
import { AutomationSlug } from "@sweetr/graphql-types/frontend/graphql";
import { LoadableContent } from "../../../components/loadable-content";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../providers/notification.provider";
import { benefitLabels } from "../../../providers/automation.provider";

export const AutomationPage = () => {
  const { workspace } = useWorkspace();
  const { slug } = useParams<{ slug: AutomationSlug }>();

  if (!slug) throw new ResourceNotFound();

  const { data, isLoading } = useWorkspaceAutomationQuery({
    workspaceId: workspace.id,
    input: { slug },
  });

  const automation = data?.workspace.automation;

  const { mutate, isPending } = useUpdateAutomationMutation({
    onSuccess: (automation) => {
      showSuccessNotification({
        message: `Automation ${
          automation.updateAutomation.enabled ? "enabled" : "disabled"
        }.`,
      });
    },
    onError: () => {
      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const handleChange = (isEnabled: boolean) => {
    mutate({
      input: {
        workspaceId: workspace.id,
        slug,
        enabled: isEnabled,
      },
    });
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Automations", href: "/automations" },
          { label: automation?.title || "" },
        ]}
      />

      <Box maw={700}>
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

              <Image
                radius="md"
                src={null}
                h={200}
                fallbackSrc="https://placehold.co/500x100?text=img"
              />
              <Text mt="sm">{automation?.description}</Text>
              <Divider label="Setup" labelPosition="left" mt="lg" mb="sm" />
              <Stack>
                <Paper withBorder p="sm">
                  <Group wrap="nowrap" justify="space-between">
                    <Text fw={500} fz="lg">
                      Enabled
                    </Text>{" "}
                    <Switch
                      size="lg"
                      color="green.7"
                      onLabel="ON"
                      offLabel="OFF"
                      checked={automation?.enabled || false}
                      onChange={(event) =>
                        handleChange(event.currentTarget.checked)
                      }
                      disabled={isPending}
                    />
                  </Group>
                </Paper>
              </Stack>

              {automation?.benefits && (
                <>
                  <Divider
                    label="Benefits"
                    labelPosition="left"
                    mt="lg"
                    mb="sm"
                  />
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
                                iconProps={{ size: "24" }}
                              />
                              <div>
                                <strong>
                                  {benefitLabels[key as AutomationBenefit]}:
                                </strong>{" "}
                                {value}.
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
