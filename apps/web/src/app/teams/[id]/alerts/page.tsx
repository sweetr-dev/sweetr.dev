import { SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { useTeamId } from "../use-team";
import { LoadableContent } from "../../../../components/loadable-content";
import {
  IconEyeCode,
  IconEyeOff,
  IconGitMerge,
  IconMessage2Exclamation,
  IconRocketOff,
} from "@tabler/icons-react";
import { CardOpenableSettings } from "../../../../components/card-openable-settings";
import { BadgeOnOff } from "../../../../components/badge-on-off";

export const TeamAlertsPage = () => {
  const teamId = useTeamId();

  return (
    <>
      <LoadableContent
        isLoading={false}
        whenLoading={
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Skeleton h={387} />
            <Skeleton h={387} />
          </SimpleGrid>
        }
        content={
          <Stack>
            <CardOpenableSettings
              left={
                <IconEyeCode
                  stroke={1}
                  size={28}
                  color="var(--mantine-color-green-4)"
                />
              }
              right={<BadgeOnOff enabled={true} available={true} />}
              title="Stuck on review"
              description="Alert when an open Pull Request has been waiting for review for too long."
              href="#"
            />
            <CardOpenableSettings
              left={
                <IconGitMerge
                  stroke={1}
                  size={28}
                  color="var(--mantine-color-green-4)"
                />
              }
              right={<BadgeOnOff enabled={true} available={true} />}
              title="Stuck on merge"
              description="Alert when an approved Pull Request has been waiting for merge for too long."
              href="#"
            />
            <CardOpenableSettings
              left={
                <IconEyeOff
                  stroke={1}
                  size={28}
                  color="var(--mantine-color-green-4)"
                />
              }
              right={<BadgeOnOff enabled={false} available={true} />}
              title="Merged PR without approval"
              description="Alert when a Pull Request is merged without approvals."
              href="#"
            />
            <CardOpenableSettings
              left={
                <IconMessage2Exclamation
                  stroke={1}
                  size={28}
                  color="var(--mantine-color-green-4)"
                />
              }
              right={<BadgeOnOff enabled={true} available={true} />}
              title="Hot Pull Request"
              description="Alert when a Pull Request has lot of comments or back-and-forth."
            />
            <CardOpenableSettings
              left={
                <IconRocketOff
                  stroke={1}
                  size={28}
                  color="var(--mantine-color-green-4)"
                />
              }
              right={<BadgeOnOff enabled={false} available={false} />}
              title="Too many unreleased changes"
              description="Alert when many merged Pull Requests are pending release."
            />
          </Stack>
        }
      />
      <Outlet />
    </>
  );
};
