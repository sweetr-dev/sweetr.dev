import {
  Avatar,
  Box,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { ButtonDocs } from "../../../../../../components/button-docs";
import { CardInfo } from "../../../../../../components/card-info";
import { DrawerScrollable } from "../../../../../../components/drawer-scrollable";
import { LoadableContent } from "../../../../../../components/loadable-content";
import { useDrawerPage } from "../../../../../../providers/drawer-page.provider";
import { useTeamId } from "../../../use-team";
import { GitActivity } from "./components/git-activity";
import { useTeamWorkLogQuery } from "../../../../../../api/work-log.api";
import { useWorkspace } from "../../../../../../providers/workspace.provider";
import { subDays } from "date-fns";

export const TeamWorkLogPage = () => {
  const teamId = useTeamId();
  const { workspace } = useWorkspace();
  const drawerProps = useDrawerPage({
    closeUrl: `/teams/${teamId}/health-and-performance/`,
  });

  const { data, isLoading } = useTeamWorkLogQuery({
    workspaceId: workspace.id,
    teamId: teamId,
    input: {
      dateRange: {
        from: subDays(new Date(), 7).toISOString(),
        to: new Date().toISOString(),
      },
    },
  });

  return (
    <>
      <DrawerScrollable
        {...drawerProps}
        title="Work log"
        size="100%"
        toolbar={
          <ButtonDocs href="http://docs.sweetr.dev/features/team/work-log" />
        }
      >
        <Box p="md">
          <CardInfo>Daily activity of the team.</CardInfo>

          <LoadableContent
            mt="md"
            isLoading={isLoading}
            whenLoading={<Skeleton h="100%" />}
            h="100%"
            content={
              <Paper withBorder>
                <Table
                  w="100%"
                  withColumnBorders
                  withRowBorders={true}
                  verticalSpacing="md"
                  horizontalSpacing="md"
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Member</Table.Th>
                      <Table.Th>Mon</Table.Th>
                      <Table.Th>Tue</Table.Th>
                      <Table.Th>Wed</Table.Th>
                      <Table.Th>Thu</Table.Th>
                      <Table.Th>Fri</Table.Th>
                      <Table.Th>Sat</Table.Th>
                      <Table.Th>Sun</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Stack gap="xs" align="center">
                            <Avatar
                              src="https://github.com/shadcn.png"
                              size={48}
                            />
                            <Text fw={500} style={{ whiteSpace: "nowrap" }}>
                              John Doe
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <GitActivity prCount={1} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity prCount={3} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity prCount={6} />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity />
                        </Table.Td>
                        <Table.Td>
                          <GitActivity />
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
