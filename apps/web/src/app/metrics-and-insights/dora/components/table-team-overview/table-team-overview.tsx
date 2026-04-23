import { useMemo, useState } from "react";
import {
  Center,
  Group,
  Paper,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { TeamDoraOverviewRow } from "@sweetr/graphql-types/frontend/graphql";
import { ThSort } from "../../../../../components/th-sort";
import { getAbbreviatedDuration } from "../../../../../providers/date.provider";
import { useFilterSearchParameters } from "../../../../../providers/filter.provider";

type SortField =
  | "teamName"
  | "deploymentCount"
  | "leadTimeMs"
  | "changeFailureRate"
  | "meanTimeToRecoverMs";
type SortDirection = "asc" | "desc";

interface TableTeamOverviewProps {
  data?: TeamDoraOverviewRow[] | null;
}

const COLUMNS: { field: SortField; label: string; align: "left" | "right" }[] =
  [
    { field: "teamName", label: "Team", align: "left" },
    { field: "deploymentCount", label: "Deployments", align: "right" },
    { field: "leadTimeMs", label: "Lead Time", align: "right" },
    { field: "changeFailureRate", label: "Failure Rate", align: "right" },
    { field: "meanTimeToRecoverMs", label: "MTTR", align: "right" },
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

  const rows = useMemo(() => {
    if (!data?.length) return [];

    return [...data].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "teamName":
          return dir * a.teamName.localeCompare(b.teamName);
        case "deploymentCount":
          return dir * (a.deploymentCount - b.deploymentCount);
        case "leadTimeMs": {
          const av = a.leadTimeMs != null ? Number(a.leadTimeMs) : -1;
          const bv = b.leadTimeMs != null ? Number(b.leadTimeMs) : -1;
          return dir * (av - bv);
        }
        case "changeFailureRate":
          return dir * (a.changeFailureRate - b.changeFailureRate);
        case "meanTimeToRecoverMs": {
          const av =
            a.meanTimeToRecoverMs != null ? Number(a.meanTimeToRecoverMs) : -1;
          const bv =
            b.meanTimeToRecoverMs != null ? Number(b.meanTimeToRecoverMs) : -1;
          return dir * (av - bv);
        }
        default:
          return 0;
      }
    });
  }, [data, sortField, sortDirection]);

  if (!data?.length) return null;

  const formatRow = (row: TeamDoraOverviewRow) => {
    const hasDeploys = row.deploymentCount > 0;
    return {
      deployments: hasDeploys ? row.deploymentCount.toLocaleString() : "–",
      lead:
        hasDeploys && row.leadTimeMs != null
          ? getAbbreviatedDuration(Number(row.leadTimeMs))
          : "–",
      cfr: hasDeploys ? `${row.changeFailureRate}%` : "–",
      mttr:
        row.meanTimeToRecoverMs != null
          ? getAbbreviatedDuration(Number(row.meanTimeToRecoverMs))
          : "–",
    };
  };

  const selectTeam = (teamId: string) => {
    searchParams.set("team", [teamId]);
  };

  return (
    <Paper withBorder bg="dark.7">
      <Table.ScrollContainer minWidth={640}>
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
            {rows.map((row) => {
              const formatted = formatRow(row);
              return (
                <Table.Tr
                  key={row.teamId}
                  style={{ cursor: "pointer" }}
                  onClick={() => selectTeam(row.teamId)}
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
                    <Text size="sm">{formatted.deployments}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.lead}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.cfr}</Text>
                  </Table.Td>
                  <Table.Td align="right">
                    <Text size="sm">{formatted.mttr}</Text>
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
