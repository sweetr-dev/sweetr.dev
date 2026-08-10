import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { parseISO } from "date-fns";
import { IconUserPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { PageEmptyState } from "../../../components/page-empty-state";
import { AvatarUser } from "../../../components/avatar-user";
import { LoaderInfiniteScroll } from "../../../components/loader-infinite-scroll";
import { useInfiniteLoading } from "../../../providers/pagination.provider";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useInfoModal } from "../../../providers/modal.provider";
import { formatLocaleDate } from "../../../providers/date.provider";
import { useWorkspaceUsersInfiniteQuery } from "../../../api/users.api";
import { WorkspaceUser } from "@sweetr/graphql-types/frontend/graphql";

export const UsersSettingsPage = () => {
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { openInfoModal } = useInfoModal();

  const {
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useWorkspaceUsersInfiniteQuery(
    {
      input: {},
      workspaceId: workspace.id,
    },
    {
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        const users = lastPage.workspace.users;
        if (users.length < 20) return undefined;
        return users.at(-1)?.id || undefined;
      },
    },
  );

  const { ref } = useInfiniteLoading({
    onIntersect: () => {
      if (isFetching || isFetchingNextPage) return;
      fetchNextPage();
    },
  });

  const users = data?.pages
    .flatMap((page) => page.workspace.users)
    .filter((user): user is WorkspaceUser => !!user);

  const hasUsers = users && users.length > 0;

  const handleInviteClick = () => {
    openInfoModal({
      title: "Invite users",
      children: (
        <Stack gap="md">
          <Text size="sm">
            Everyone from your GitHub organization can log in to Sweetr by
            default. No invite is needed — they just need to sign in with their
            GitHub account.
          </Text>
          <Text size="sm">
            You can limit access to specific roles in workspace settings.
          </Text>
        </Stack>
      ),
    });
  };

  return (
    <PageContainer>
      <Breadcrumbs
        items={[{ label: "Settings", href: "/settings" }, { label: "Users" }]}
      />

      <Box maw={800}>
        <Group justify="space-between" mb="sm">
          <Title order={4}>Users</Title>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconUserPlus size={16} stroke={1.5} />}
            onClick={handleInviteClick}
          >
            Invite member
          </Button>
        </Group>

        {isLoading && <PageSkeleton />}

        {hasUsers && (
          <Paper radius="md" p="lg" withBorder>
            <Table withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Member</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Last login</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Group gap="xs">
                      <AvatarUser
                        src={user.avatar}
                        name={user.name}
                        size={32}
                      />
                      <div>
                        <Text fz="sm" fw={500}>
                          {user.name}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          @{user.handle}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {user.role && (
                      <Badge
                        variant="light"
                        color={user.role === "ADMIN" ? "blue" : "gray"}
                      >
                        {user.role}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm" c="dimmed">
                      {user.lastLoginAt
                        ? formatLocaleDate(parseISO(user.lastLoginAt), {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never"}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          </Paper>
        )}

        {!isFetching && !hasUsers && (
          <PageEmptyState message="This workspace has no users." />
        )}

        {hasNextPage && (
          <Box mt="lg">
            <LoaderInfiniteScroll ref={ref} />
          </Box>
        )}
      </Box>
    </PageContainer>
  );
};

const PageSkeleton = () => (
  <>
    <Skeleton height={40} mb="xs" />
    <Skeleton height={40} mb="xs" />
    <Skeleton height={40} mb="xs" />
  </>
);
