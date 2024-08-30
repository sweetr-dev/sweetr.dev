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
  Badge,
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
import { useWorkspace } from "../../../../providers/workspace.provider";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { ListScopes } from "../components/list-scopes";
import { Link, useSearchParams } from "react-router-dom";

export const IntegrationSlackPage = () => {
  const { workspace } = useWorkspace();
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const isInstalled = true && !code;

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
              <Skeleton h={250} mt={26} />
              <Skeleton h={70} mt="lg" />
              <Skeleton h={70} mt="lg" />
            </>
          }
          isLoading={false}
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

              {isInstalled && (
                <>
                  <Title order={5} mb="xs">
                    Status
                  </Title>
                  <Paper p="md" radius="md" mb="lg" withBorder>
                    <Group>
                      <ThemeIcon color="green" variant="outline" bd="none">
                        <IconCircleCheckFilled size={24} stroke={1.5} />
                      </ThemeIcon>
                      Connected to WorkspaceName on May 24th, 2024
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
                    Send weekly digest of teams' relevant metrics.
                  </List.Item>
                </List>
              </Paper>

              <Title order={5} mb="xs" mt="lg">
                Scopes
              </Title>
              <Paper withBorder p="md">
                <Text>
                  Review the {isInstalled ? "granted" : "requested"} access:
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

              {!isInstalled && (
                <Button
                  mt="lg"
                  fullWidth
                  component={Link}
                  to="https://slack.com/oauth/v2/authorize?client_id=5240948949014.7590067125669&scope=app_mentions:read,channels:join,users.profile:read,users:read,users:read.email&user_scope="
                  loading={!!code}
                >
                  Install
                </Button>
              )}

              {isInstalled && (
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
