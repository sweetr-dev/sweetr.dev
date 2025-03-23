import { useForm } from "@mantine/form";
import {
  ActivityEvent,
  TeamMemberRole,
} from "@sweetr/graphql-types/frontend/graphql";
import { startOfDay, subDays, endOfToday, formatISO } from "date-fns";
import { useTeamWorkLogQuery } from "../../../../api/work-log.api";
import { useFilterSearchParameters } from "../../../../providers/filter.provider";
import { useWorkspace } from "../../../../providers/workspace.provider";
import { useTeamId } from "../use-team";
import { useMemo } from "react";

type WorkLogData = Record<
  string,
  {
    name: string;
    avatar?: string | null;
    handle: string;
    role: TeamMemberRole;
    events: ActivityEvent[][];
    totals: Record<NonNullable<ActivityEvent["__typename"]>, number>;
  }
>;

export const useWorkLog = () => {
  const { workspace } = useWorkspace();
  const teamId = useTeamId();
  const searchParams = useFilterSearchParameters();
  const filters = useForm<{
    from: string | null;
    to: string | null;
  }>({
    initialValues: {
      from:
        searchParams.get("from") ||
        formatISO(startOfDay(subDays(new Date(), 6))),
      to: searchParams.get("to") || formatISO(endOfToday()),
    },
  });

  const { data, isLoading } = useTeamWorkLogQuery({
    workspaceId: workspace.id,
    teamId: teamId,
    input: {
      dateRange: {
        from: filters.values.from,
        to: filters.values.to,
      },
    },
  });

  const getDateYmd = (date: string) => {
    return date.split("T")[0];
  };

  const workLog = data?.workspace?.team?.workLog;
  const teamMembers = data?.workspace?.team?.members;

  const columns = useMemo(() => {
    return workLog?.columns.map((column) => getDateYmd(column)) || [];
  }, [workLog?.columns]);

  const workLogData: WorkLogData = useMemo(() => {
    const data: WorkLogData = {};

    teamMembers?.forEach((member) => {
      data[member.person.id] = {
        name: member.person.name,
        avatar: member.person.avatar,
        handle: member.person.handle,
        role: member.role,
        events: [...Array.from({ length: columns.length }, () => [])],
        totals: {
          CodeReviewSubmittedEvent: 0,
          PullRequestCreatedEvent: 0,
          PullRequestMergedEvent: 0,
        },
      };
    });

    workLog?.data?.forEach((event) => {
      const author =
        "pullRequest" in event
          ? event.pullRequest.author
          : event.codeReview.author;

      const eventDay = getDateYmd(event.eventAt);
      const index = columns.findIndex((column) => column === eventDay);

      if (!data[author.id]) return;

      data[author.id].events[index]?.push(event as ActivityEvent);

      data[author.id].totals[event.__typename]++;
    });

    return data;
  }, [workLog?.data, columns, teamMembers]);

  return {
    isLoading,
    filters,
    workLog: {
      data: workLogData,
      columns,
    },
  };
};
