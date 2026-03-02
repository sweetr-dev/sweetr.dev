import {
  Anchor,
  Box,
  Grid,
  Portal,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Outlet, useParams } from "react-router";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { usePersonQuery } from "../../../../api/people.api";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { PageContainer } from "../../../../components/page-container";
import { ResourceNotFound } from "../../../../exceptions/resource-not-found.exception";
import { SubnavPerson } from "../components/subnav-person";
import { AvatarUser } from "../../../../components/avatar-user";

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

      <Stack mb="xs" align="center">
        <AvatarUser
          src={person.avatar}
          size={250}
          name={person.name}
          radius="50%"
          styles={{
            root: {
              border: "10px solid var(--mantine-color-gray-3)",
            },
          }}
        />

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
      </Stack>

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
