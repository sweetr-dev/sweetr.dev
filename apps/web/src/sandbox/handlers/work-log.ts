import { graphql, HttpResponse } from "msw";
import {
  CodeReviewState,
  Period,
  PullRequestSize,
  PullRequestState,
} from "@sweetr/graphql-types/frontend/graphql";
import { generateBuckets } from "../generators/chart-data";
import { TEAMS } from "../fixtures/teams";
import { PEOPLE } from "../fixtures/people";
import {
  subMonths,
  parseISO,
  addDays,
  differenceInDays,
  addHours,
} from "date-fns";

const MS_HOUR = 3_600_000;
const MS_MINUTE = 60_000;

const PR_TITLES = [
  "feat: add user notification preferences",
  "fix: prevent duplicate webhook events",
  "chore: upgrade TypeScript to 5.4",
  "feat: team analytics export to CSV",
  "fix: timezone handling in date pickers",
  "refactor: extract shared validation utils",
  "feat: add Slack thread replies support",
  "fix: pagination cursor off-by-one",
  "chore: remove deprecated API endpoints",
  "feat: custom dashboard layouts",
  "fix: memory leak in WebSocket reconnect",
  "feat: pull request size breakdown chart",
  "fix: incorrect cycle time calculation",
  "chore: migrate to Vitest from Jest",
  "feat: environment promotion workflow",
  "fix: avatar loading flicker on navigation",
  "refactor: consolidate GraphQL fragments",
  "feat: incident severity classification",
  "fix: search not matching partial handles",
  "chore: add missing index on deployments table",
  "feat: digest email template redesign",
  "fix: stale data after team member removal",
  "feat: code review heatmap visualization",
  "fix: mobile nav not closing on route change",
  "chore: bump dependencies batch March 2026",
  "feat: deployment rollback tracking",
  "fix: alert threshold not persisting",
  "refactor: simplify auth middleware chain",
  "feat: personal goals and targets",
  "fix: chart tooltip clipped at edge of viewport",
];

const SIZES: PullRequestSize[] = [
  PullRequestSize.TINY,
  PullRequestSize.SMALL,
  PullRequestSize.SMALL,
  PullRequestSize.MEDIUM,
  PullRequestSize.MEDIUM,
  PullRequestSize.LARGE,
];

const sizeStats: Record<
  PullRequestSize,
  { files: number; added: number; deleted: number }
> = {
  [PullRequestSize.TINY]: { files: 2, added: 12, deleted: 5 },
  [PullRequestSize.SMALL]: { files: 5, added: 85, deleted: 30 },
  [PullRequestSize.MEDIUM]: { files: 10, added: 280, deleted: 90 },
  [PullRequestSize.LARGE]: { files: 18, added: 650, deleted: 200 },
  [PullRequestSize.HUGE]: { files: 30, added: 1800, deleted: 500 },
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateWorkLogEvents(
  from: string,
  to: string,
  teamMembers: typeof TEAMS[number]["members"],
) {
  const start = parseISO(from);
  const end = parseISO(to);
  const totalDays = differenceInDays(end, start);
  const events: Array<Record<string, unknown>> = [];

  let prCounter = 1000;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const day = addDays(start, dayOffset);
    const dayOfWeek = day.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const member of teamMembers) {
      const person = PEOPLE.find((p) => p.id === member.person.id);
      if (!person) continue;

      const seed = dayOffset * 100 + Number(person.id);
      const rand = seededRandom(seed);

      const actionsToday = rand < 0.15 ? 0 : rand < 0.5 ? 1 : rand < 0.8 ? 2 : 3;

      for (let action = 0; action < actionsToday; action++) {
        const actionSeed = seed * 10 + action;
        const actionRand = seededRandom(actionSeed);
        const hourOffset = 9 + Math.floor(actionRand * 8);
        const eventTime = addHours(day, hourOffset);

        const titleIndex = (prCounter + Math.floor(actionRand * 7)) % PR_TITLES.length;
        const sizeIndex = Math.floor(seededRandom(actionSeed + 1) * SIZES.length);
        const size = SIZES[sizeIndex];
        const stats = sizeStats[size];

        const prId = `pr-wl-${prCounter++}`;
        const createdAt = eventTime.toISOString();

        const pr = {
          __typename: "PullRequest",
          id: prId,
          title: PR_TITLES[titleIndex],
          gitUrl: `https://github.com/sweetr-dev/sweetr.dev/pull/${prCounter}`,
          commentCount: Math.floor(seededRandom(actionSeed + 2) * 8),
          changedFilesCount: stats.files,
          linesAddedCount: stats.added,
          linesDeletedCount: stats.deleted,
          state: PullRequestState.MERGED,
          createdAt,
          mergedAt: addHours(eventTime, 2 + Math.floor(actionRand * 6)).toISOString(),
          closedAt: addHours(eventTime, 2 + Math.floor(actionRand * 6)).toISOString(),
          tracking: {
            __typename: "PullRequestTracking",
            size,
            changedFilesCount: stats.files,
            linesAddedCount: stats.added,
            linesDeletedCount: stats.deleted,
            timeToCode: Math.floor((1 + actionRand * 4) * MS_HOUR),
            timeToFirstReview: Math.floor((0.5 + actionRand * 3) * MS_HOUR),
            timeToFirstApproval: Math.floor((1 + actionRand * 4) * MS_HOUR),
            timeToMerge: Math.floor((0.25 + actionRand) * MS_HOUR),
            timeToDeploy: Math.floor(30 * MS_MINUTE),
            firstReviewAt: addHours(eventTime, 1).toISOString(),
            firstApprovalAt: addHours(eventTime, 1.5).toISOString(),
            firstDeployedAt: addHours(eventTime, 3).toISOString(),
            cycleTime: Math.floor((3 + actionRand * 8) * MS_HOUR),
          },
          author: {
            __typename: "Person",
            id: person.id,
            name: person.name,
            handle: person.handle,
            avatar: person.avatar,
          },
          repository: {
            __typename: "Repository",
            id: "1",
            name: "sweetr.dev",
            fullName: "sweetr-dev/sweetr.dev",
          },
        };

        const eventType = seededRandom(actionSeed + 3);

        if (eventType < 0.4) {
          events.push({
            __typename: "PullRequestCreatedEvent",
            eventAt: createdAt,
            pullRequest: pr,
          });
        } else if (eventType < 0.7) {
          events.push({
            __typename: "PullRequestMergedEvent",
            eventAt: pr.mergedAt,
            pullRequest: pr,
          });
        } else {
          const reviewerPool = PEOPLE.filter((p) => p.id !== person.id);
          const reviewer =
            reviewerPool[
              Math.floor(seededRandom(actionSeed + 4) * reviewerPool.length)
            ];

          events.push({
            __typename: "CodeReviewSubmittedEvent",
            eventAt: addHours(eventTime, 1).toISOString(),
            codeReview: {
              __typename: "CodeReview",
              id: `cr-wl-${prId}`,
              state: seededRandom(actionSeed + 5) > 0.3
                ? CodeReviewState.APPROVED
                : CodeReviewState.CHANGES_REQUESTED,
              commentCount: 1 + Math.floor(seededRandom(actionSeed + 6) * 4),
              createdAt: addHours(eventTime, 1).toISOString(),
              author: {
                __typename: "Person",
                id: reviewer.id,
                name: reviewer.name,
                handle: reviewer.handle,
                avatar: reviewer.avatar,
              },
              pullRequest: pr,
            },
          });
        }
      }
    }
  }

  return events;
}

export const workLogHandlers = [
  graphql.query("TeamWorkLog", ({ variables }) => {
    const teamId = variables.teamId as string;
    const input = variables.input as Record<string, unknown>;
    const dateRange = (input.dateRange ?? {}) as {
      from?: string;
      to?: string;
    };
    const from = dateRange.from ?? subMonths(new Date(), 1).toISOString();
    const to = dateRange.to ?? new Date().toISOString();

    const team = TEAMS.find((t) => t.id === teamId) ?? TEAMS[0];
    const columns = generateBuckets(from, to, Period.DAILY);
    const events = generateWorkLogEvents(from, to, team.members);

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          team: {
            __typename: "Team",
            members: team.members,
            workLog: {
              __typename: "TeamWorkLogResponse",
              columns,
              data: events,
            },
          },
        },
      },
    });
  }),
];
