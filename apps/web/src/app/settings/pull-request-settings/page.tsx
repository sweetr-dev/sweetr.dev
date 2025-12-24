import { Box, Title, Stack } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { CardSetting } from "../../../components/card-setting";
import { Outlet } from "react-router-dom";
import { IconRuler } from "@tabler/icons-react";

export const PullRequestSettingsPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Pull Request" }]} />

      <Box maw={600}>
        <Title order={3} mb="md">
          Pull Request
        </Title>

        <Stack>
          <CardSetting
            left={
              <IconRuler
                stroke={1}
                size={28}
                color="var(--mantine-color-green-4)"
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
