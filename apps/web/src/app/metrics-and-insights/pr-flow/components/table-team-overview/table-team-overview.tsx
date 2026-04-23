import { useState, useMemo } from "react";
import {
  Table,
  Paper,
  Group,
  Text,
  UnstyledButton,
  Center,
} from "@mantine/core";
import { TeamPrFlowOverviewRow } from "@sweetr/graphql-types/frontend/graphql";
import { ThSort } from "../../../../../components/th-sort";
import { getAbbreviatedDuration } from "../../../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

type SortField =
  | "teamName"
  | "medianCycleTime"
  | "mergedCount"
  | "avgLinesChanged"
  | "pctBigPrs";
type SortDirection = "asc" | "desc";

interface TableTeamOverviewProps {
  data?: TeamPrFlowOverviewRow[] | null;
}

const COLUMNS: { field: SortField; label: string; align: "left" | "right" }[] =
  [
    { field: "teamName", label: "Team", align: "left" },
    { field: "medianCycleTime", label: "Median Cycle Time", align: "right" },
    { field: "mergedCount", label: "Merged PRs", align: "right" },
    { field: "avgLinesChanged", label: "Avg PR Size", align: "right" },
    { field: "pctBigPrs", label: "% Large+ PRs", align: "right" },
  ];

export const TableTeamOverview = ({ data }: TableTeamOverviewProps) => {
  const searchParams = useFilterSearchParameters();
  const [sortField, setSortField] = useState<SortField>("teamName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "teamName" ? "asc" : "desc");
    }
  };

  const orgRow = data?.find((r) => r.teamId == null);
  const teamRows = useMemo(() => {
    if (!data) return [];

    const teams = data.filter((r) => r.teamId != null);
    const sorted = [...teams].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "teamName":
          return dir * a.teamName.localeCompare(b.teamName);
        case "medianCycleTime":
          return dir * (Number(a.medianCycleTime) - Number(b.medianCycleTime));
        case "mergedCount":
          return dir * (a.mergedCount - b.mergedCount);
        case "avgLinesChanged":
          return dir * (a.avgLinesChanged - b.avgLinesChanged);
        case "pctBigPrs":
          return dir * (a.pctBigPrs - b.pctBigPrs);
        default:
          return 0;
      }
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  if (!data?.length) return null;

  const formatRow = (row: TeamPrFlowOverviewRow) => {
    const hasData = row.mergedCount > 0;
    return {
      cycleTime: Number(row.medianCycleTime)
        ? getAbbreviatedDuration(Number(row.medianCycleTime))
        : hasData
          ? "0s"
          : "–",
      merged: hasData ? row.mergedCount.toLocaleString() : "–",
      avgSize: hasData ? Math.round(row.avgLinesChanged).toLocaleString() : "–",
      bigPrs: hasData ? `${Math.round(row.pctBigPrs)}%` : "–",
    };
  };

  const selectTeam = (teamId: string) => {
    searchParams.set("team", [teamId]);
  };

  return (
    <Paper withBorder bg="dark.7">
      <Table.ScrollContainer minWidth={500}>
        <Table verticalSpacing="xs" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              {COLUMNS.map((col) => (
                <Table.Th key={col.field} ta={col.align}>
                  <UnstyledButton onClick={() => handleSort(col.field)}>
                    <Group
                      gap={4}
                      justify={
                        col.align === "right" ? "flex-end" : "flex-start"
                      }
                      wrap="nowrap"
                    >
                      <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                        {col.label}
                      </Text>
                      <Center>
                        <ThSort
                          active={col.field === sortField}
                          direction={sortDirection}
                        />
                      </Center>
                    </Group>
                  </UnstyledButton>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orgRow && (
              <Table.Tr bg="dark.6">
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {orgRow.teamName}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Text size="sm" fw={600}>
                    {formatRow(orgRow).cycleTime}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Text size="sm" fw={600}>
                    {formatRow(orgRow).merged}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Text size="sm" fw={600}>
                    {formatRow(orgRow).avgSize}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Text size="sm" fw={600}>
                    {formatRow(orgRow).bigPrs}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {teamRows.map((row) => {
              const formatted = formatRow(row);
              return (
                <Table.Tr
                  key={row.teamId}
                  style={{ cursor: "pointer" }}
                  onClick={() => selectTeam(row.teamId!)}
                >
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" component="span">
                        {row.teamIcon}
                      </Text>
                      <Text size="sm">{row.teamName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.cycleTime}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.merged}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.avgSize}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.bigPrs}</Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};
