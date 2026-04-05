import { subDays, subHours } from "date-fns";
import { PEOPLE } from "./people";

const daysAgo = (days: number) => subDays(new Date(), days).toISOString();
const hoursAgo = (hours: number) => subHours(new Date(), hours).toISOString();

const APP_API = {
  __typename: "Application" as const,
  id: "1",
  name: "sweetr-api",
};

const APP_WEB = {
  __typename: "Application" as const,
  id: "2",
  name: "sweetr-web",
};

const ENV_PROD = {
  __typename: "Environment" as const,
  name: "production",
  isProduction: true,
};

const ENV_STAGING = {
  __typename: "Environment" as const,
  name: "staging",
  isProduction: false,
};

const person = (p: (typeof PEOPLE)[number]) => ({
  __typename: "Person" as const,
  id: p.id,
  name: p.name,
  avatar: p.avatar,
});

const [guest, priya, alex, sam, jordan] = PEOPLE;

export const deploymentsFixture = [
  {
    __typename: "Deployment" as const,
    id: "dep-1",
    version: "v2.14.0",
    description: "feat: workspace analytics dashboard",
    deployedAt: hoursAgo(3),
    archivedAt: null,
    pullRequestCount: 4,
    application: APP_API,
    environment: ENV_PROD,
    author: person(guest),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-2",
    version: "v2.13.2",
    description: "fix: rate limiter edge case",
    deployedAt: daysAgo(1),
    archivedAt: null,
    pullRequestCount: 2,
    application: APP_WEB,
    environment: ENV_PROD,
    author: person(priya),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-3",
    version: "v2.13.1",
    description: "chore: bump fastify to 5.8.3",
    deployedAt: daysAgo(3),
    archivedAt: null,
    pullRequestCount: 1,
    application: APP_API,
    environment: ENV_PROD,
    author: person(alex),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-4",
    version: "v2.13.0",
    description: "feat: sandbox mode for demo",
    deployedAt: daysAgo(5),
    archivedAt: null,
    pullRequestCount: 3,
    application: APP_WEB,
    environment: ENV_PROD,
    author: person(guest),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-5",
    version: "v2.12.1",
    description: "fix: docs links and broken references",
    deployedAt: daysAgo(8),
    archivedAt: null,
    pullRequestCount: 1,
    application: APP_API,
    environment: ENV_PROD,
    author: person(sam),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-6",
    version: "v2.12.0",
    description: "feat: easy self-hosting support",
    deployedAt: daysAgo(12),
    archivedAt: null,
    pullRequestCount: 5,
    application: APP_API,
    environment: ENV_PROD,
    author: person(priya),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-7",
    version: "v2.11.3",
    description: "feat: sync people bio and location",
    deployedAt: daysAgo(18),
    archivedAt: null,
    pullRequestCount: 2,
    application: APP_WEB,
    environment: ENV_PROD,
    author: person(jordan),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-8",
    version: "v2.11.2",
    description: "feat: incident detection automation",
    deployedAt: daysAgo(22),
    archivedAt: null,
    pullRequestCount: 3,
    application: APP_API,
    environment: ENV_PROD,
    author: person(alex),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-9",
    version: "v2.11.1",
    description: "feat: migrate to Fastify",
    deployedAt: daysAgo(28),
    archivedAt: null,
    pullRequestCount: 4,
    application: APP_API,
    environment: ENV_PROD,
    author: person(guest),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-10",
    version: "v2.15.0-rc.1",
    description: "feat: deployment rollback tracking",
    deployedAt: hoursAgo(6),
    archivedAt: null,
    pullRequestCount: 2,
    application: APP_API,
    environment: ENV_STAGING,
    author: person(sam),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-11",
    version: "v2.14.1-rc.1",
    description: "fix: alert threshold persistence",
    deployedAt: daysAgo(2),
    archivedAt: null,
    pullRequestCount: 1,
    application: APP_WEB,
    environment: ENV_STAGING,
    author: person(jordan),
  },
  {
    __typename: "Deployment" as const,
    id: "dep-12",
    version: "v2.11.0",
    description: "chore: add docker workflow",
    deployedAt: daysAgo(32),
    archivedAt: null,
    pullRequestCount: 2,
    application: APP_API,
    environment: ENV_PROD,
    author: person(priya),
  },
];
