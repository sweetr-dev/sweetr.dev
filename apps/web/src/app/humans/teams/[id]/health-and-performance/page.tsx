import { SimpleGrid } from "@mantine/core";
import { Outlet } from "react-router-dom";
import {
  IconClock,
  IconEyeCheck,
  IconEyeDiscount,
  IconEyeStar,
  IconGitMerge,
  IconRuler,
} from "@tabler/icons-react";
import { PaperTitle } from "../../../../../components/paper-title";
import { CardChart } from "./components/card-chart/card-chart";
import { useTeamId } from "../use-team";

export const TeamHealthAndPerformancePage = () => {
  const teamId = useTeamId();

  return (
    <>
      <PaperTitle mb={5} color="red">
        Health
      </PaperTitle>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
        <CardChart
          icon={IconEyeDiscount}
          label="Code review distribution"
          description="Is anyone handling majority of reviews by themselves?"
          href={`/humans/teams/${teamId}/health-and-performance/activity/code-review-distribution`}
        />
      </SimpleGrid>

      <PaperTitle mb={5} mt="xl">
        Pull Request
      </PaperTitle>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
        <CardChart
          icon={IconRuler}
          label="Size distribution"
          description="Is the team striving for small PRs?"
          href={`/humans/teams/${teamId}/health-and-performance/pull-requests/size-distribution`}
        />
        <CardChart
          icon={IconClock}
          label="Cycle time"
          description="Time between first commit and merge."
          href={`/humans/teams/${teamId}/health-and-performance/pull-requests/cycle-time`}
        />

        <CardChart
          icon={IconGitMerge}
          label="Time to merge"
          description="Time between approval and merge."
          href={`/humans/teams/${teamId}/health-and-performance/pull-requests/time-to-merge`}
        />
      </SimpleGrid>

      <PaperTitle mb={5} mt="xl">
        Code review
      </PaperTitle>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
        <CardChart
          icon={IconEyeStar}
          label="Time to first review"
          description="Time between reviewer requested and first review."
          href={`/humans/teams/${teamId}/health-and-performance/code-reviews/time-to-first-review`}
        />

        <CardChart
          icon={IconEyeCheck}
          label="Time to approve"
          description="Time between reviewer requested and first approval."
          href={`/humans/teams/${teamId}/health-and-performance/code-reviews/time-to-approve`}
        />
      </SimpleGrid>

      <Outlet />
    </>
  );
};
