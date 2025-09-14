import { Group, Paper, Skeleton, Table } from "@mantine/core";
import { LoadableContent } from "../../../../../components/loadable-content";
import { GitActivity } from "./components/git-activity";
import {
  formatDate,
  formatLocaleDate,
  parseNullableISO,
} from "../../../../../providers/date.provider";
import { IconCalendarFilled } from "@tabler/icons-react";
import { FilterWeek } from "../../../../../components/filter-week";
import { useWorkLog } from "./use-work-log";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";
import { useFullWidthPage } from "../../../../../providers/page.provider";
import { formatISO, parseISO } from "date-fns";
import { CellAuthor } from "./components/cell-author/cell-author";
import { IconCodeReview } from "./components/icon-code-review";
import { IconOpenedPR } from "./components/icon-opened-pr";
import { IconMergedPR } from "./components/icon-merged-pr";

export const TeamWorkLogPage = () => {
  const searchParams = useFilterSearchParameters();
  const { isLoading, workLog, filters } = useWorkLog();
  useFullWidthPage();

  return (
    <>
      <Group mt="md" justify="space-between" align="end">
        <Group wrap="nowrap" gap={5}>
          <FilterWeek
            label="Week of"
            icon={IconCalendarFilled}
            onChange={(dates) => {
              const from = dates[0] ? formatISO(dates[0]) : null;
              const to = dates[1] ? formatISO(dates[1]) : null;

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
          <Group gap={5} ml={5}>
            <IconCodeReview size={20} />
            Code review
          </Group>
          •
          <Group gap={5}>
            <IconOpenedPR size={20} />
            Opened PR
          </Group>
          •
          <Group gap={5}>
            <IconMergedPR size={20} />
            Merged PR
          </Group>
        </Group>
      </Group>
      <LoadableContent
        mt="md"
        isLoading={isLoading}
        whenLoading={<Skeleton h={600} />}
        h="100%"
        content={
          <Paper withBorder>
            <Table.ScrollContainer minWidth={500} type="native">
              <Table
                withColumnBorders
                verticalSpacing="lg"
                bg="dark.7"
                horizontalSpacing="sm"
              >
                <Table.Thead bg="dark.6">
                  <Table.Tr>
                    <Table.Th>Member</Table.Th>
                    {workLog.columns.map((column, index) => (
                      <Table.Th key={index}>
                        {formatLocaleDate(parseISO(column), {
                          day: "2-digit",
                          month: "2-digit",
                        })}{" "}
                        {formatDate(column, "EEE")}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(workLog.data).map(([authorId, author]) => (
                    <Table.Tr key={authorId}>
                      <Table.Td w={160}>
                        <CellAuthor author={author} />
                      </Table.Td>
                      {workLog.columns.map((_, index) => (
                        <Table.Td key={index}>
                          <GitActivity events={author.events[index]} />
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        }
      />
    </>
  );
};
