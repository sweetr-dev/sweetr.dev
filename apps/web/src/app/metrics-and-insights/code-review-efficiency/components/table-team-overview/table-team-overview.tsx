import { useState, useMemo } from "react";
import {
  Table,
  Paper,
  Group,
  Text,
  UnstyledButton,
  Center,
} from "@mantine/core";
import { CodeReviewTeamOverviewRow } from "@sweetr/graphql-types/frontend/graphql";
import { ThSort } from "../../../../../components/th-sort";
import { getAbbreviatedDuration } from "../../../../../providers/date.provider";

type SortField =
  | "teamName"
  | "avgTimeToFirstReview"
  | "avgTimeToApproval"
  | "prsWithoutApproval";
type SortDirection = "asc" | "desc";

interface TableTeamOverviewProps {
  data?: CodeReviewTeamOverviewRow[] | null;
}

const COLUMNS: { field: SortField; label: string; align: "left" | "right" }[] =
  [
    { field: "teamName", label: "Team", align: "left" },
    {
      field: "avgTimeToFirstReview",
      label: "Avg Time to First Review",
      align: "right",
    },
    {
      field: "avgTimeToApproval",
      label: "Avg Time to Approval",
      align: "right",
    },
    {
      field: "prsWithoutApproval",
      label: "Merged Without Approval",
      align: "right",
    },
  ];

export const TableTeamOverview = ({ data }: TableTeamOverviewProps) => {
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
        case "avgTimeToFirstReview":
          return (
            dir *
            (Number(a.avgTimeToFirstReview) - Number(b.avgTimeToFirstReview))
          );
        case "avgTimeToApproval":
          return (
            dir * (Number(a.avgTimeToApproval) - Number(b.avgTimeToApproval))
          );
        case "prsWithoutApproval":
          return dir * (a.prsWithoutApproval - b.prsWithoutApproval);
        default:
          return 0;
      }
    });

    return sorted;
  }, [data, sortField, sortDirection]);

  if (!data?.length) return null;

  const hasAnyData = data.some(
    (r) =>
      Number(r.avgTimeToFirstReview) > 0 ||
      Number(r.avgTimeToApproval) > 0 ||
      r.prsWithoutApproval > 0,
  );

  const formatRow = (row: CodeReviewTeamOverviewRow) => {
    const hasData =
      Number(row.avgTimeToFirstReview) > 0 ||
      Number(row.avgTimeToApproval) > 0 ||
      row.prsWithoutApproval > 0;

    return {
      timeToFirstReview: Number(row.avgTimeToFirstReview)
        ? getAbbreviatedDuration(Number(row.avgTimeToFirstReview))
        : hasData
          ? "0s"
          : "–",
      timeToApproval: Number(row.avgTimeToApproval)
        ? getAbbreviatedDuration(Number(row.avgTimeToApproval))
        : hasData
          ? "0s"
          : "–",
      prsWithoutApproval: hasData
        ? row.prsWithoutApproval.toLocaleString()
        : "–",
    };
  };

  if (!hasAnyData) return null;

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
                    {formatRow(orgRow).timeToFirstReview}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Text size="sm" fw={600}>
                    {formatRow(orgRow).timeToApproval}
                  </Text>
                </Table.Td>
                <Table.Td align="right">
                  <Text size="sm" fw={600}>
                    {formatRow(orgRow).prsWithoutApproval}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {teamRows.map((row) => {
              const formatted = formatRow(row);
              return (
                <Table.Tr key={row.teamId}>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm" component="span">
                        {row.teamIcon}
                      </Text>
                      <Text size="sm">{row.teamName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.timeToFirstReview}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.timeToApproval}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.prsWithoutApproval}</Text>
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
