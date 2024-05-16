import { ThemeIcon } from "@mantine/core";
import {
  IconGitPullRequest,
  IconGitPullRequestClosed,
  IconGitMerge,
  IconGitPullRequestDraft,
} from "@tabler/icons-react";
import { PullRequestState } from "@sweetr/graphql-types/frontend/graphql";

interface IconPullRequestStateProps {
  state: PullRequestState;
}

export const IconPullRequestState = ({ state }: IconPullRequestStateProps) => {
  if (state === PullRequestState.DRAFT) {
    return (
      <ThemeIcon variant="light" color="gray" size="xl">
        <IconGitPullRequestDraft stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === PullRequestState.OPEN) {
    return (
      <ThemeIcon variant="light" color="green" size="xl">
        <IconGitPullRequest stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === PullRequestState.CLOSED) {
    return (
      <ThemeIcon variant="light" color="red" size="xl">
        <IconGitPullRequestClosed stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === PullRequestState.MERGED) {
    return (
      <ThemeIcon variant="light" color="#a371f7" size="xl">
        <IconGitMerge stroke={1.5} />
      </ThemeIcon>
    );
  }
};
