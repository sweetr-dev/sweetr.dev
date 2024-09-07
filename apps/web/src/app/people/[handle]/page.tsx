import {
  Anchor,
  Avatar,
  Box,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageTitle } from "../../../components/page-title";
import { usePersonQuery } from "../../../api/people.api";
import { useWorkspace } from "../../../providers/workspace.provider";
import { IconEyeCode, IconGitPullRequest, IconHome } from "@tabler/icons-react";
import { PageContainer } from "../../../components/page-container";
import { ResourceNotFound } from "../../../exceptions/resource-not-found.exception";

export const PersonPage = () => {
  const { handle } = useParams();
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  const navigate = useNavigate();

  if (!handle) throw new ResourceNotFound();

  const { data, isLoading } = usePersonQuery(
    { workspaceId: workspace.id, handle },
    { enabled: !!workspace.id },
  );

  const tab =
    ["pull-requests", "code-reviews"].find(
      (path) => path === pathname.split("/").pop(),
    ) || "overview";

  const person = data?.workspace.person;

  if (!person || isLoading) {
    return <PageSkeleton />;
  }

  const navigateTo = (path: string) =>
    navigate(`/people/${person.handle}/${path}`);

  const handleChangeTab = (tab: string | null) => {
    if (!tab || tab === "overview") return navigateTo("");

    return navigateTo(tab);
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "People", href: "/people" },
          { label: person.name || handle || "" },
        ]}
      />

      <PageTitle
        title={
          <Group mb="xs">
            <Avatar src={person.avatar} radius="50%" size={80} />

            <Stack gap={2}>
              <Title order={3}>{person.name}</Title>

              <Anchor
                c="dimmed"
                href={`https://github.com/${person.handle}`}
                target="_blank"
              >
                <Text size="sm">@{person.handle}</Text>
              </Anchor>
            </Stack>
          </Group>
        }
      />

      <Paper radius="sm">
        <Tabs
          value={tab}
          defaultValue="overview"
          onChange={handleChangeTab}
          radius="sm"
          variant="default"
        >
          <Tabs.List>
            <Tabs.Tab
              value="overview"
              onClick={() => navigateTo("")}
              leftSection={<IconHome size={24} stroke={1.5} />}
            >
              Overview
            </Tabs.Tab>
            <Tabs.Tab
              value="pull-requests"
              onClick={() => navigateTo("pull-requests")}
              leftSection={<IconGitPullRequest size={24} stroke={1.5} />}
            >
              Pull Requests
            </Tabs.Tab>
            <Tabs.Tab
              value="code-reviews"
              onClick={() => navigateTo("code-reviews")}
              leftSection={<IconEyeCode size={24} stroke={1.5} />}
            >
              Code Reviews
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Paper>

      <Box mt="xl">
        <Outlet context={{ personId: person.id }} />
      </Box>
    </PageContainer>
  );
};

const PageSkeleton = (): JSX.Element => (
  <PageContainer>
    <Grid>
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Skeleton height={20} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}></Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Skeleton height={20} />
      </Grid.Col>
    </Grid>
    <Grid mt={26}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Skeleton height={300} />
      </Grid.Col>
    </Grid>
  </PageContainer>
);
