import {
  Box,
  Group,
  Text,
  Title,
  Button,
  Anchor,
  Skeleton,
  List,
  rem,
  ThemeIcon,
  Paper,
} from "@mantine/core";
import {
  IconBook2,
  IconCheck,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { ImageIntegrationLogo } from "../components/image-integration-logo";
import { LoadableContent } from "../../../../components/loadable-content";
import { PageContainer } from "../../../../components/page-container";
import { PageTitle } from "../../../../components/page-title";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { ListScopes } from "../components/list-scopes";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useIntegrations } from "../useIntegrations";
import { formatDate } from "../../../../providers/date.provider";
import { useInstallIntegrationMutation } from "../../../../api/integrations.api";
import { useEffect } from "react";
import { IntegrationApp } from "@sweetr/graphql-types/frontend/graphql";
import { useWorkspace } from "../../../../providers/workspace.provider";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../../../providers/notification.provider";

export const IntegrationSlackPage = () => {
  const [searchParams] = useSearchParams();
  const { integrations, isLoading } = useIntegrations();
  const { workspace } = useWorkspace();
  const { mutate } = useInstallIntegrationMutation();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const integration = integrations?.SLACK;

  useEffect(() => {
    if (!code || !state) return;

    mutate(
      {
        input: {
          workspaceId: workspace.id,
          app: IntegrationApp.SLACK,
          code,
          state: decodeURIComponent(state),
        },
      },
      {
        onSuccess: () => {
          showSuccessNotification({
            message: "Slack successfully integrated.",
          });
        },
        onError: () => {
          showErrorNotification({
            message: "Something went wrong. Please re-install the app.",
          });
        },
        onSettled: () => {
          navigate("/settings/integrations/slack");
        },
      },
    );
  }, [code, mutate, navigate, state, workspace.id]);

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Integrations", href: "/settings/integrations" },
          { label: "Slack" },
        ]}
      />

      <Box maw={560}>
        <LoadableContent
          whenLoading={
            <>
              <Skeleton h={50} />
              <Skeleton h={175} mt={24} />
              <Skeleton h={232} mt="lg" />
              <Skeleton h={36} mt="lg" />
            </>
          }
          isLoading={isLoading && !code}
          content={
            <>
              <PageTitle
                title={
                  <Group gap="md">
                    <ImageIntegrationLogo brand="slack" h={40} />
                    <Title mb={0} order={2}>
                      Slack
                    </Title>
                  </Group>
                }
              >
                <Anchor
                  underline="never"
                  target="_blank"
                  href="https://docs.sweetr.dev"
                >
                  <Button
                    variant="subtle"
                    color="dark.1"
                    leftSection={<IconBook2 stroke={1.5} size={20} />}
                  >
                    Docs
                  </Button>
                </Anchor>
              </PageTitle>

              {integration?.isEnabled && (
                <>
                  <Title order={5} mb="xs">
                    Status
                  </Title>
                  <Paper p="md" radius="md" mb="lg" withBorder>
                    <Group>
                      <ThemeIcon color="green" variant="outline" bd="none">
                        <IconCircleCheckFilled size={24} stroke={1.5} />
                      </ThemeIcon>
                      Connected to {integration.target} on{" "}
                      {formatDate(integration.enabledAt, "MMMM do, yyyy")}
                    </Group>
                  </Paper>
                </>
              )}

              <Title order={5} mb="xs">
                Description
              </Title>
              <Paper withBorder p="md">
                <Text>
                  Integrate with your Slack workspace to allow Sweetr to send
                  notifications.
                </Text>
                <List
                  mt="xs"
                  spacing="xs"
                  center
                  icon={
                    <ThemeIcon
                      color="green"
                      variant="light"
                      size={20}
                      radius="sm"
                    >
                      <IconCheck style={{ width: rem(16), height: rem(16) }} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    Remind reviewers about PRs awaiting their review.
                  </List.Item>
                  <List.Item>
                    Remind developers about their stale PRs.
                  </List.Item>
                  <List.Item>
                    Send weekly digest of teams&apos; relevant metrics.
                  </List.Item>
                </List>
              </Paper>

              <Title order={5} mb="xs" mt="lg">
                Scopes
              </Title>
              <Paper withBorder p="md">
                <Text>
                  Review the {integration?.isEnabled ? "granted" : "requested"}{" "}
                  access:
                </Text>
                <ListScopes
                  scopes={[
                    {
                      label: "View messages that directly mention @Sweetr",
                      tooltip:
                        "Required to be able to respond to certain commands.",
                    },
                    {
                      label: "Join public channels in a workspace",
                      tooltip:
                        "Required to join team channels to send weekly digests.",
                    },
                    {
                      label:
                        "Start direct messages and send messages as @Sweetr",
                      tooltip: "Required to send reminders.",
                    },
                    {
                      label:
                        "View people's profile details and email addresses in a workspace",
                      tooltip:
                        "Required to automatically associate a Slack user to a GitHub profile.",
                    },
                  ]}
                />
              </Paper>

              {integration &&
                !integration?.isEnabled &&
                integration.installUrl && (
                  <Button
                    mt="lg"
                    fullWidth
                    component={Link}
                    to={integration.installUrl}
                    loading={!!code}
                  >
                    Install
                  </Button>
                )}

              {integration?.isEnabled && (
                <Button mt="lg" fullWidth color="red" variant="outline">
                  Uninstall
                </Button>
              )}
            </>
          }
        />
      </Box>
    </PageContainer>
  );
};