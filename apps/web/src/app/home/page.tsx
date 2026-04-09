import { Box, Title, Text, Stack } from "@mantine/core";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { getFirstName } from "../../providers/person.provider";
import { PageContainer } from "../../components/page-container";
import { useAuthenticatedUser } from "../../providers/auth.provider";
import { MyOpenPullRequests } from "./components/my-open-pull-requests";
import { TeamOpenPullRequests } from "./components/team-open-pull-requests";
import { MyStats } from "./components/my-stats";
import { useSyncProgress } from "./use-sync-progress";
import { AlertTrial } from "../../components/alert-trial";
import { SyncOnboarding } from "./components/sync-onboarding";

export const HomePage = () => {
  const { user } = useAuthenticatedUser();
  const { syncStatus, progress, acknowledge, showOnboarding } =
    useSyncProgress();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Home" }]} />

      {showOnboarding ? (
        <SyncOnboarding
          progress={progress}
          isCompleted={syncStatus === "completed"}
          onAcknowledge={acknowledge}
        />
      ) : (
        <>
          <AlertTrial mb={32} mt={-16} />

          {user && (
            <Title order={1} size="h3">
              {`Welcome, ${getFirstName(user.name)} 👋`}
            </Title>
          )}

          <Box mt="md">
            <Text>
              How you have been helping your team in the last 30 days.
            </Text>
            <MyStats mt="xs" />
          </Box>

          <Stack mt="xl" gap="xl">
            <TeamOpenPullRequests />
            <MyOpenPullRequests />
          </Stack>
        </>
      )}
    </PageContainer>
  );
};
