import type { ChartCodeReviewDistributionQuery } from "@sweetr/graphql-types/frontend/graphql";
import { PEOPLE } from "./people";

const reviewerEntity = (
  person: (typeof PEOPLE)[number],
  reviewCount: number,
  reviewSharePercentage: number,
) => ({
  __typename: "CodeReviewDistributionEntity" as const,
  id: `cr-author:${person.handle}`,
  name: person.name,
  image: person.avatar,
  reviewCount,
  reviewSharePercentage,
});

const prAuthorEntity = (person: (typeof PEOPLE)[number]) => ({
  __typename: "CodeReviewDistributionEntity" as const,
  id: `${person.handle}:sweetr-dev:internal`,
  name: person.name,
  image: person.avatar,
  reviewCount: null,
  reviewSharePercentage: null,
});

const link = (sourceHandle: string, targetHandle: string, value: number) => ({
  __typename: "GraphChartLink" as const,
  source: `cr-author:${sourceHandle}`,
  target: `${targetHandle}:sweetr-dev:internal`,
  value,
});

const [guest, priya, alex, sam, jordan] = PEOPLE;

export const codeReviewDistributionFixture = {
  workspace: {
    __typename: "Workspace" as const,
    metrics: {
      __typename: "Metrics" as const,
      codeReviewDistribution: {
        __typename: "CodeReviewDistributionChartData" as const,
        totalReviews: 62,
        entities: [
          reviewerEntity(guest, 18, 29),
          reviewerEntity(priya, 15, 24),
          reviewerEntity(alex, 12, 19),
          reviewerEntity(sam, 10, 16),
          reviewerEntity(jordan, 7, 12),
          prAuthorEntity(guest),
          prAuthorEntity(priya),
          prAuthorEntity(alex),
          prAuthorEntity(sam),
          prAuthorEntity(jordan),
        ],
        links: [
          link(guest.handle, priya.handle, 8),
          link(guest.handle, alex.handle, 6),
          link(guest.handle, sam.handle, 4),
          link(priya.handle, guest.handle, 7),
          link(priya.handle, alex.handle, 5),
          link(priya.handle, jordan.handle, 3),
          link(alex.handle, guest.handle, 5),
          link(alex.handle, sam.handle, 4),
          link(alex.handle, jordan.handle, 3),
          link(sam.handle, priya.handle, 6),
          link(sam.handle, jordan.handle, 4),
          link(jordan.handle, guest.handle, 4),
          link(jordan.handle, priya.handle, 3),
        ],
      },
    },
  },
} satisfies ChartCodeReviewDistributionQuery;
