import {
  Avatar,
  Badge,
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { ButtonDocs } from "../../../../../../components/button-docs";
import { CardInfo } from "../../../../../../components/card-info";
import { DrawerScrollable } from "../../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../../components/loadable-content";
import { useDrawerPage } from "../../../../../../providers/drawer-page.provider";
import { useTeamId } from "../../../use-team";
import { GitActivity } from "./components/git-activity";
import {
  formatDate,
  parseNullableISO,
} from "../../../../../../providers/date.provider";
import {
  IconCalendar,
  IconHexagonFilled,
  IconMessageFilled,
} from "@tabler/icons-react";
import { FilterWeek } from "../../../../../../components/filter-week";
import { useWorkLog } from "./use-work-log";
import { useFilterSearchParameters } from "../../../../../../providers/filter.provider";
import { useMediaQuery } from "@mantine/hooks";
import { teamRoleColorMap } from "../../../../../../providers/team-role.provider";

export const TeamWorkLogPage = () => {
  const teamId = useTeamId();
  const drawerProps = useDrawerPage({
    closeUrl: `/teams/${teamId}/health-and-performance/`,
  });
  const searchParams = useFilterSearchParameters();
  const { isLoading, workLog, filters } = useWorkLog();
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Work log"
        size={isSmallScreen ? "100%" : "calc(100% - 329px)"}
        toolbar={
          <ButtonDocs href="http://docs.sweetr.dev/features/team/work-log" />
        }
      >
        <Box p="md">
          <CardInfo>Daily activity of the team.</CardInfo>
          <Group mt="md" justify="space-between" align="end">
            <Group wrap="nowrap" gap={5}>
              <FilterWeek
                label="Week of"
                icon={IconCalendar}
                onChange={(dates) => {
                  const from = dates[0]?.toISOString() || null;
                  const to = dates[1]?.toISOString() || null;

                  filters.setFieldValue("from", from);
                  filters.setFieldValue("to", to);
                  searchParams.set("from", from);
                  searchParams.set("to", to);
                }}
                value={[
                  parseNullableISO(filters.values.from) || null,
                  parseNullableISO(filters.values.to) || null,
                ]}
              />
            </Group>
            <Group>
              <Text fw={500}>Legend:</Text>
              <Group gap={5}>
                <IconMessageFilled
                  stroke={1.5}
                  size={20}
                  style={{ color: "white", opacity: 0.8 }}
                />
                Code review
              </Group>
              <Group gap={5}>
                <IconHexagonFilled
                  stroke={1.5}
                  size={20}
                  style={{
                    color: "var(--mantine-color-green-4)",
                    opacity: 0.8,
                  }}
                />
                Opened PR
              </Group>
              <Group gap={5}>
                <IconHexagonFilled
                  stroke={1.5}
                  size={20}
                  style={{
                    color: "var(--mantine-color-violet-4)",
                    opacity: 0.8,
                  }}
                />
                Merged PR
              </Group>
            </Group>
          </Group>
          <LoadableContent
            mt="md"
            isLoading={isLoading}
            whenLoading={<Skeleton h={300} />}
            h="100%"
            content={
              <Paper withBorder>
                <Table
                  w="100%"
                  withColumnBorders
                  withRowBorders={false}
                  verticalSpacing="lg"
                  striped
                  bg="dark.5"
                  horizontalSpacing="sm"
                >
                  <Table.Thead bg="dark.6">
                    <Table.Tr>
                      <Table.Th>Member</Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[0], "dd/MM EEE")}
                      </Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[1], "dd/MM EEE")}
                      </Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[2], "dd/MM EEE")}
                      </Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[3], "dd/MM EEE")}
                      </Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[4], "dd/MM EEE")}
                      </Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[5], "dd/MM EEE")}
                      </Table.Th>
                      <Table.Th>
                        {formatDate(workLog.columns[6], "dd/MM EEE")}
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Object.entries(workLog.data).map(([authorId, author]) => (
                      <Table.Tr key={authorId}>
                        <Table.Td w={160}>
                          <Stack gap={5} align="center">
                            <Avatar src={author.avatar} size={40} />
                            <Text style={{ whiteSpace: "nowrap" }}>
                              {author.name}
                            </Text>

                            <Badge
                              variant="light"
                              size="sm"
                              color={teamRoleColorMap[author.role]}
                            >
                              {author.role}
                            </Badge>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[0]} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[1]} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[2]} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[3]} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[4]} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[5]} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity events={author.events[6]} />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            }
          />
        </Box>
      </DrawerScrollable>
    </>
  );
};
