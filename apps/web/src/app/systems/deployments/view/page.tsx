import { useParams } from "react-router-dom";
import { useDeploymentQuery } from "../../../../api/deployments.api";
import { DrawerScrollable } from "../../../../components/drawer-scrollable";
import { ResourceNotFound } from "../../../../exceptions/resource-not-found.exception";
import { useDrawerPage } from "../../../../providers/drawer-page.provider";
import { useFilterSearchParameters } from "../../../../providers/filter.provider";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { LoadableContent } from "../../../../components/loadable-content";
import { PageEmptyState } from "../../../../components/page-empty-state";
import {
  Stack,
  Input,
  Skeleton,
  Title,
  Text,
  Divider,
  Group,
  Code,
  Anchor,
  Box,
  Badge,
} from "@mantine/core";
import { CardPullRequest } from "../../../../components/card-pull-request";
import { formatLocaleDate } from "../../../../providers/date.provider";
import { parseISO } from "date-fns";
import { getGithubCommitOrTagUrl } from "../../../../providers/github.provider";

export const DeploymentsViewPage = () => {
  const searchParams = useFilterSearchParameters();
  const drawerProps = useDrawerPage({
    closeUrl: `/systems/deployments/?${searchParams.toString()}`,
  });
  const { workspace } = useWorkspace();
  const { deploymentId } = useParams();

  if (!deploymentId) throw new ResourceNotFound();

  const { data, isLoading } = useDeploymentQuery({
    workspaceId: workspace.id,
    deploymentId: deploymentId,
  });

  const deployment = data?.workspace.deployment;

  return (
    <>
      <DrawerScrollable {...drawerProps} title="Deployment" size="60rem">
        <LoadableContent
          isLoading={isLoading}
          whenLoading={
            <Stack p="md">
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={20} />
              <Skeleton height={220} />
            </Stack>
          }
          whenEmpty={<PageEmptyState message="Deployment not found" />}
          content={
            <>
              {deployment && (
                <>
                  <Stack p="md">
                    <Title order={5}>Details</Title>

                    <Group gap="xl">
                      <Stack gap={0}>
                        <Input.Label>Application</Input.Label>
                        <Box>
                          <Code variant="default" c="white" fz="sm">
                            {deployment.application.name}
                          </Code>
                        </Box>
                      </Stack>
                      <Stack gap={0}>
                        <Input.Label>Date</Input.Label>
                        <Text>
                          {formatLocaleDate(parseISO(deployment.deployedAt), {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </Text>
                      </Stack>
                      <Stack gap={0}>
                        <Input.Label>Environment</Input.Label>
                        <Badge
                          variant="light"
                          color={
                            deployment.environment.isProduction
                              ? "green"
                              : "gray"
                          }
                        >
                          {deployment.environment.name}
                        </Badge>
                      </Stack>
                      <Stack gap={0}>
                        <Input.Label>Version</Input.Label>
                        <Anchor
                          target="_blank"
                          rel="nofollow"
                          href={getGithubCommitOrTagUrl(
                            deployment.application.repository.fullName,
                            deployment.version,
                          )}
                        >
                          {deployment.version}
                        </Anchor>
                      </Stack>

                      <Stack gap={0}>
                        <Input.Label>Deployed by</Input.Label>
                        {deployment.author?.name || "Unknown"}
                      </Stack>
                    </Group>
                  </Stack>
                  <Divider my="sm" />
                  <Stack p="md">
                    <Title order={5}>Pull Requests</Title>
                    {deployment?.pullRequests.map((pullRequest) => (
                      <CardPullRequest
                        pullRequest={pullRequest}
                        key={pullRequest.id}
                        py="xs"
                      />
                    ))}
                    {deployment?.pullRequests.length === 0 && (
                      <Text>No pull requests found</Text>
                    )}
                  </Stack>
                </>
              )}
            </>
          }
        />
      </DrawerScrollable>
    </>
  );
};
