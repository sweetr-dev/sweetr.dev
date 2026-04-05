import { subDays, subHours } from "date-fns";
import { PEOPLE } from "./people";
import { deploymentsFixture } from "./deployments";

const daysAgo = (days: number) => subDays(new Date(), days).toISOString();
const hoursAgo = (hours: number) => subHours(new Date(), hours).toISOString();

const [guest, priya, alex, sam, jordan] = PEOPLE;

const causeDep = (depId: string) => {
  const dep = deploymentsFixture.find((d) => d.id === depId)!;
  return {
    __typename: "Deployment" as const,
    id: dep.id,
    version: dep.version,
    application: dep.application,
  };
};

const fixDep = (depId: string) => {
  const dep = deploymentsFixture.find((d) => d.id === depId)!;
  return {
    __typename: "Deployment" as const,
    id: dep.id,
    version: dep.version,
    application: dep.application,
  };
};

const leader = (p: (typeof PEOPLE)[number]) => ({
  __typename: "Person" as const,
  id: p.id,
  name: p.name,
  avatar: p.avatar,
});

export const incidentsFixture = [
  {
    __typename: "Incident" as const,
    id: "inc-1",
    detectedAt: hoursAgo(2),
    resolvedAt: null,
    postmortemUrl: null,
    archivedAt: null,
    team: { __typename: "Team" as const, id: "1", name: "Platform", icon: "🛠️" },
    leader: leader(guest),
    causeDeployment: causeDep("dep-1"),
    fixDeployment: null,
  },
  {
    __typename: "Incident" as const,
    id: "inc-2",
    detectedAt: daysAgo(4),
    resolvedAt: daysAgo(4),
    postmortemUrl: "https://github.com/sweetr-dev/sweetr.dev/wiki/postmortem-inc-2",
    archivedAt: null,
    team: { __typename: "Team" as const, id: "2", name: "Frontend", icon: "🎨" },
    leader: leader(priya),
    causeDeployment: causeDep("dep-4"),
    fixDeployment: fixDep("dep-3"),
  },
  {
    __typename: "Incident" as const,
    id: "inc-3",
    detectedAt: daysAgo(15),
    resolvedAt: daysAgo(14),
    postmortemUrl: "https://github.com/sweetr-dev/sweetr.dev/wiki/postmortem-inc-3",
    archivedAt: null,
    team: { __typename: "Team" as const, id: "1", name: "Platform", icon: "🛠️" },
    leader: leader(alex),
    causeDeployment: causeDep("dep-6"),
    fixDeployment: fixDep("dep-5"),
  },
  {
    __typename: "Incident" as const,
    id: "inc-4",
    detectedAt: daysAgo(25),
    resolvedAt: daysAgo(24),
    postmortemUrl: null,
    archivedAt: null,
    team: { __typename: "Team" as const, id: "1", name: "Platform", icon: "🛠️" },
    leader: leader(sam),
    causeDeployment: causeDep("dep-8"),
    fixDeployment: fixDep("dep-7"),
  },
  {
    __typename: "Incident" as const,
    id: "inc-5",
    detectedAt: daysAgo(30),
    resolvedAt: daysAgo(29),
    postmortemUrl: "https://github.com/sweetr-dev/sweetr.dev/wiki/postmortem-inc-5",
    archivedAt: null,
    team: { __typename: "Team" as const, id: "2", name: "Frontend", icon: "🎨" },
    leader: leader(jordan),
    causeDeployment: causeDep("dep-9"),
    fixDeployment: fixDep("dep-9"),
  },
];
