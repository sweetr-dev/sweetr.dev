export type CodeReviewDistributionRow = {
  source: string;
  target: string;
  value: number;
  isTargetFromTeam: boolean;
  crAuthorName: string;
  crAuthorAvatar?: string;
  prAuthorName: string;
  prAuthorAvatar?: string;
};

export type CodeReviewLink = {
  source: string;
  target: string;
  value: number;
  isFromTeam: boolean;
};
