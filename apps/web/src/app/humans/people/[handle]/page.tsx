import {
  Anchor,
  Avatar,
  Box,
  Grid,
  Group,
  Portal,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Outlet, useParams } from "react-router-dom";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { PageTitle } from "../../../../components/page-title";
import { usePersonQuery } from "../../../../api/people.api";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { PageContainer } from "../../../../components/page-container";
import { ResourceNotFound } from "../../../../exceptions/resource-not-found.exception";
import { SubnavPerson } from "../components/subnav-person";

export const PersonPage = () => {
  const { handle } = useParams();
  const { workspace } = useWorkspace();

  if (!handle) throw new ResourceNotFound();

  const { data, isLoading } = usePersonQuery(
    { workspaceId: workspace.id, handle },
    { enabled: !!workspace.id },
  );

  const person = data?.workspace.person;

  if (!person || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "People", href: "/humans/people" },
          { label: person.name || handle || "" },
        ]}
      />

      <Portal target="#subnav">
        <SubnavPerson person={person} />
      </Portal>

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

      <Box mt="md">
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
