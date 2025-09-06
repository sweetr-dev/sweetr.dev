import { DigestType } from "@sweetr/graphql-types/frontend/graphql";
import { fork } from "radash";

interface DigestCardData {
  type: DigestType;
  available: boolean;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  getRoute: (teamId: string) => string;
}

const digestCards: Record<DigestType, DigestCardData> = {
  [DigestType.TEAM_METRICS]: {
    available: true,
    type: DigestType.TEAM_METRICS,
    title: "Metrics Digest",
    description:
      "Sends a digest of key metrics and how they have changed since last period.",
    shortDescription: "Summary of key metrics changes in the last period",
    imageUrl: "/images/digests/metrics.webp",
    getRoute: (teamId) => `/humans/teams/${teamId}/digests/metrics`,
  },
  [DigestType.TEAM_WIP]: {
    available: true,
    type: DigestType.TEAM_WIP,
    title: "Work In Progress Digest",
    description:
      "Sends a digest of Pull Requests that are in draft or pending review or merge.",
    shortDescription: "Summary of Pull Requests open or pending review.",
    imageUrl: "/images/digests/wip.webp",
    getRoute: (teamId) => `/humans/teams/${teamId}/digests/wip`,
  },
};

export type DigestCard = (typeof digestCards)[keyof typeof digestCards];

interface UseDigestCards {
  digestCards: typeof digestCards;
  availableDigests: DigestCard[];
  futureDigests: DigestCard[];
}

export const useDigestCards = (): UseDigestCards => {
  const [availableDigests, futureDigests] = fork(
    Object.values(digestCards),
    (digestCard) => digestCard.available,
  );

  return {
    digestCards,
    availableDigests,
    futureDigests,
  };
};
