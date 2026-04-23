import { PEOPLE } from "./people";

type Person = (typeof PEOPLE)[number];

const reviewerId = (reviewer: Person) => `cr-author:${reviewer.handle}`;

const prAuthorId = (prAuthor: Person, reviewer: Person) =>
  `${prAuthor.handle}:${reviewer.name}`;

const [guest, priya, alex, sam, jordan] = PEOPLE;

const isTeammate = (a: Person, b: Person) =>
  a.handle !== "guest" && b.handle !== "guest";

const reviewConnections: Array<{
  reviewer: Person;
  prAuthor: Person;
  value: number;
}> = [
  { reviewer: guest, prAuthor: priya, value: 8 },
  { reviewer: guest, prAuthor: alex, value: 6 },
  { reviewer: guest, prAuthor: sam, value: 4 },
  { reviewer: priya, prAuthor: guest, value: 7 },
  { reviewer: priya, prAuthor: alex, value: 5 },
  { reviewer: priya, prAuthor: jordan, value: 3 },
  { reviewer: alex, prAuthor: guest, value: 5 },
  { reviewer: alex, prAuthor: sam, value: 4 },
  { reviewer: alex, prAuthor: jordan, value: 3 },
  { reviewer: sam, prAuthor: priya, value: 6 },
  { reviewer: sam, prAuthor: jordan, value: 4 },
  { reviewer: jordan, prAuthor: guest, value: 4 },
  { reviewer: jordan, prAuthor: priya, value: 3 },
];

const links = reviewConnections.map((connection) => ({
  __typename: "GraphChartLink" as const,
  source: reviewerId(connection.reviewer),
  target: prAuthorId(connection.prAuthor, connection.reviewer),
  value: connection.value,
  isFromTeam: isTeammate(connection.reviewer, connection.prAuthor),
}));

const reviewerTotals = new Map<Person, number>();
reviewConnections.forEach((connection) => {
  reviewerTotals.set(
    connection.reviewer,
    (reviewerTotals.get(connection.reviewer) ?? 0) + connection.value,
  );
});

const totalReviews = Array.from(reviewerTotals.values()).reduce(
  (sum, value) => sum + value,
  0,
);

const reviewerEntities = Array.from(reviewerTotals.entries())
  .sort(([, a], [, b]) => b - a)
  .map(([reviewer, reviewCount]) => ({
    __typename: "CodeReviewDistributionEntity" as const,
    id: reviewerId(reviewer),
    name: reviewer.name,
    image: reviewer.avatar,
    reviewCount,
    reviewSharePercentage: Math.round((reviewCount * 100) / totalReviews),
  }));

const prAuthorEntitiesMap = new Map<
  string,
  { prAuthor: Person; reviewer: Person }
>();
reviewConnections.forEach((connection) => {
  const id = prAuthorId(connection.prAuthor, connection.reviewer);
  if (!prAuthorEntitiesMap.has(id)) {
    prAuthorEntitiesMap.set(id, {
      prAuthor: connection.prAuthor,
      reviewer: connection.reviewer,
    });
  }
});

const prAuthorEntities = Array.from(prAuthorEntitiesMap.entries()).map(
  ([id, { prAuthor }]) => ({
    __typename: "CodeReviewDistributionEntity" as const,
    id,
    name: prAuthor.name,
    image: prAuthor.avatar,
    reviewCount: null,
    reviewSharePercentage: null,
  }),
);

export const codeReviewDistributionFixture = {
  workspace: {
    __typename: "Workspace" as const,
    metrics: {
      __typename: "Metrics" as const,
      codeReviewDistribution: {
        __typename: "CodeReviewDistributionChartData" as const,
        totalReviews,
        entities: [...reviewerEntities, ...prAuthorEntities],
        links,
      },
    },
  },
};
