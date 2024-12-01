import { Box, Title, Stack } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { IconAspectRatio } from "@tabler/icons-react";
import { CardOpenableSettings } from "../components/card-openable-settings";
import { Outlet } from "react-router-dom";

export const PullRequestSettingsPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Pull Request" }]} />

      <Box maw={600}>
        <Title order={3} mb="md">
          Pull Request
        </Title>

        <Stack>
          <CardOpenableSettings
            icon={
              <IconAspectRatio
                stroke={1.5}
                size={28}
                color="var(--mantine-color-green-5)"
              />
            }
            title="Size Calculation"
            description="Manage sizing and files to be ignored."
            href="/settings/pull-request/size"
          />
        </Stack>
      </Box>

      <Outlet />
    </PageContainer>
  );
};
