import { Box, SimpleGrid, Skeleton } from "@mantine/core";
import { CardPerson } from "../../../../../components/card-person";
import { useOutletContext } from "react-router-dom";
import { useTeamQuery } from "../../../../../api/teams.api";
import { PageEmptyState } from "../../../../../components/page-empty-state";
import { TeamOutletContext } from "../types";
import { useWorkspace } from "../../../../../providers/workspace.provider";
import { useTeamId } from "../use-team";

export const TeamMembersPage = () => {
  const { workspace } = useWorkspace();
  const teamId = useTeamId();
  const { drawerControl } = useOutletContext<TeamOutletContext>();

  const { data, isLoading } = useTeamQuery(
    {
      teamId: teamId,
      workspaceId: workspace.id,
    },
    { enabled: !!teamId },
  );

  const members = data?.workspace?.team?.members;
  const hasMembers = members && members.length > 0;

  if (!isLoading && !hasMembers) {
    return (
      <Box mt={80}>
        <PageEmptyState
          message="This team has no members."
          action="Edit team"
          onClick={() => drawerControl.open()}
        />
      </Box>
    );
  }

  return (
    <>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {isLoading && <PageSkeleton />}

        {!isLoading &&
          hasMembers &&
          members.map((member) => (
            <CardPerson
              key={member.person.id}
              name={member.person.name || member.person.handle}
              handle={member.person.handle}
              avatar={member.person.avatar || undefined}
              role={member.role}
            />
          ))}
      </SimpleGrid>
    </>
  );
};

const PageSkeleton = (): JSX.Element => (
  <SimpleGrid cols={{ base: 12, md: 3 }} spacing="lg">
    <Skeleton height={182} />
    <Skeleton height={182} />
    <Skeleton height={182} />
    <Skeleton height={182} />
  </SimpleGrid>
);
