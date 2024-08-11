import { Box, Title, Text } from "@mantine/core";
import { Breadcrumbs } from "../../components/breadcrumbs";
import { getFirstName } from "../../providers/person.provider";
import { PageContainer } from "../../components/page-container";
import { useAuthenticatedUser } from "../../providers/auth.provider";
import { MyOpenPullRequests } from "./components/my-open-pull-requests";
import { TeamOpenPullRequests } from "./components/team-open-pull-requests";
import { MyStats } from "./components/my-stats";
import { useSyncProgressNotification } from "./use-sync-progress-notification";
import { AlertTrial } from "../../components/alert-trial";

export const HomePage = () => {
  const { user } = useAuthenticatedUser();
  useSyncProgressNotification();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Home" }]} />
      <AlertTrial mb={32} mt={-32} />
      {user && (
        <Title order={1} size="h3">
          {`Welcome, ${getFirstName(user.name)} 👋`}
        </Title>
      )}
      <Box mt="md">
        <Text>How you have been helping your team in the last 30 days.</Text>
        <MyStats mt="xs" />
      </Box>

      <Box mt="xl">
        <Text>Your teams&apos; open work.</Text>
        <TeamOpenPullRequests mt="xs" />
      </Box>

      <Box mt="xl">
        <Text>Your open work.</Text>
        <MyOpenPullRequests mt="xs" />
      </Box>
    </PageContainer>
  );
};
