import {
  Box,
  Button,
  Skeleton,
  Image,
  Group,
  Divider,
  Text,
  Stack,
  Title,
  Switch,
  TextInput,
  Alert,
  Chip,
  InputLabel,
  Select,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { DrawerScrollable } from "../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../components/loadable-content";
import { ResourceNotFound } from "../../../../../exceptions/resource-not-found.exception";
import { useDrawerPage } from "../../../../../providers/drawer-page.provider";
import { useMessagingIntegration } from "../../../../../providers/integration.provider";
import ImageMetrics from "../assets/metrics.webp";
import { BoxSetting } from "../../../../../components/box-setting";
import {
  IconAlertHexagon,
  IconBrandSlack,
  IconClock,
  IconExternalLink,
  IconWorld,
} from "@tabler/icons-react";
import { SelectHour } from "../../../../../components/select-hour";
import { SelectTimezone } from "../../../../../components/select-timezone/select-timezone";
import { useState } from "react";
import { WeekDay } from "../../../../../providers/date.provider";
export const TeamDigestMetricsPage = () => {
  const { teamId } = useParams();
  const { integration, query } = useMessagingIntegration();
  const drawerProps = useDrawerPage({
    closeUrl: `/teams/${teamId}/digests`,
  });
  const [selectedDay, setSelectedDay] = useState<
    string | string[] | undefined
  >();

  if (!teamId) throw new ResourceNotFound();

  return (
    <DrawerScrollable
      {...drawerProps}
      title="Metrics Digest"
      actions={<Button type="submit">Update digest</Button>}
    >
      <LoadableContent
        whenLoading={
          <>
            <Skeleton h={50} />
            <Skeleton h={175} mt={24} />
            <Skeleton h={232} mt="lg" />
            <Skeleton h={36} mt="lg" />
          </>
        }
        isLoading={query.isLoading}
        content={
          <>
            <Group bg="#1a1d20" justify="center">
              <Image src={ImageMetrics} w="auto" h="auto" />
            </Group>
            <Divider />
            <Stack p="md">
              <Text>
                Sends a digest of key metrics and how they have changed since
                last period.
              </Text>
            </Stack>
            <Divider />

            {!integration && (
              <Stack p="md">
                <Alert
                  variant="light"
                  color="violet"
                  styles={{
                    wrapper: {
                      alignItems: "center",
                    },
                  }}
                  icon={<IconAlertHexagon stroke={1.5} />}
                >
                  <Group justify="space-between">
                    <Text>
                      Setup integration with Slack to enable this feature.
                    </Text>
                    <Button
                      size="xs"
                      variant="filled"
                      component={Link}
                      target="_blank"
                      to={`/settings/integrations/slack`}
                      color="violet"
                      rightSection={<IconExternalLink stroke={1.5} size={16} />}
                    >
                      Enable
                    </Button>
                  </Group>
                </Alert>
              </Stack>
            )}

            {integration && (
              <>
                <Stack p="md">
                  <Title order={5}>Settings</Title>

                  <BoxSetting label="Enabled">
                    <Switch
                      size="lg"
                      color="green.7"
                      onLabel="ON"
                      offLabel="OFF"
                    />
                  </BoxSetting>

                  <TextInput
                    label="Channel"
                    leftSection={<IconBrandSlack stroke={1.5} />}
                    placeholder="#team"
                  />
                </Stack>

                <Divider my="md" />

                <Stack p="md" pb="xl">
                  <Title order={5}>Schedule</Title>

                  <Select
                    label="Frequency"
                    data={[
                      { value: "weekly", label: "Every week" },
                      {
                        value: "monthly",
                        label: `First of the month`,
                      },
                    ]}
                  />
                  <Box>
                    <InputLabel>Day of the week</InputLabel>
                    <Chip.Group
                      value={selectedDay}
                      onChange={(value) => {
                        setSelectedDay(value);
                      }}
                    >
                      <Group>
                        <Chip value={`${WeekDay.MONDAY}`} size="xs">
                          Monday
                        </Chip>
                        <Chip value={`${WeekDay.TUESDAY}`} size="xs">
                          Tuesday
                        </Chip>
                        <Chip value={`${WeekDay.WEDNESDAY}`} size="xs">
                          Wednesday
                        </Chip>
                        <Chip value={`${WeekDay.THURSDAY}`} size="xs">
                          Thursday
                        </Chip>
                        <Chip value={`${WeekDay.FRIDAY}`} size="xs">
                          Friday
                        </Chip>
                        <Chip value={`${WeekDay.SATURDAY}`} size="xs">
                          Saturday
                        </Chip>
                        <Chip value={`${WeekDay.SUNDAY}`} size="xs">
                          Sunday
                        </Chip>
                      </Group>
                    </Chip.Group>
                  </Box>
                  <Group grow>
                    <SelectHour
                      label="Time"
                      leftSection={<IconClock size={16} stroke={1.5} />}
                    />
                    <SelectTimezone
                      label="Timezone"
                      leftSection={<IconWorld size={16} stroke={1.5} />}
                    />
                  </Group>
                </Stack>
              </>
            )}
          </>
        }
      />
    </DrawerScrollable>
  );
};
