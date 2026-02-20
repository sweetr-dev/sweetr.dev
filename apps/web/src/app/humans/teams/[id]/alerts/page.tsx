import { SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { useTeamId } from "../use-team";
import { LoadableContent } from "../../../../../components/loadable-content";
import { CardSetting } from "../../../../../components/card-setting";
import { BadgeOnOff } from "../../../../../components/badge-on-off";
import { useAlerts } from "./use-alerts";
import { useMessagingIntegration } from "../../../../../providers/integration.provider";
import { useAlertCards } from "./use-alert-cards";
import { AlertEnableFeature } from "../../../../../components/alert-enable-feature/alert-enable-feature";

export const TeamAlertsPage = () => {
  const teamId = useTeamId();
  const { availableAlerts, futureAlerts } = useAlertCards();
  const { alerts, isLoading } = useAlerts({ teamId });
  const { integration } = useMessagingIntegration();

  return (
    <>
      <LoadableContent
        isLoading={isLoading}
        whenLoading={
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <Skeleton h={387} />
            <Skeleton h={387} />
          </SimpleGrid>
        }
        content={
          <>
            {!integration && <AlertEnableFeature feature="slack" mb="md" />}
            <Stack>
              {availableAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <CardSetting
                    key={alert.type}
                    href={alert.getRoute(teamId)}
                    left={
                      <Icon
                        stroke={1}
                        size={28}
                        color="var(--mantine-color-green-4)"
                      />
                    }
                    right={
                      <BadgeOnOff
                        enabled={
                          (alerts?.[alert.type]?.enabled && !!integration) ||
                          false
                        }
                        available={true}
                      />
                    }
                    description={alert.description}
                    title={alert.title}
                  />
                );
              })}

              {futureAlerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <CardSetting
                    key={alert.type}
                    left={
                      <Icon
                        stroke={1}
                        size={28}
                        color="var(--mantine-color-green-4)"
                      />
                    }
                    right={<BadgeOnOff enabled={false} available={false} />}
                    description={alert.description}
                    title={alert.title}
                  />
                );
              })}
            </Stack>
          </>
        }
      />
      <Outlet />
    </>
  );
};
