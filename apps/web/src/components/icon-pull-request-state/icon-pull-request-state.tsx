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
      <ThemeIcon variant="transparent" color="gray" size={20}>
        <IconGitPullRequestDraft stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === PullRequestState.OPEN) {
    return (
      <ThemeIcon variant="transparent" color="#3fb950" size={20}>
        <IconGitPullRequest stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === PullRequestState.CLOSED) {
    return (
      <ThemeIcon variant="transparent" color="#f85149" size={20}>
        <IconGitPullRequestClosed stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === PullRequestState.MERGED) {
    return (
      <ThemeIcon variant="transparent" color="#a371f7" size={20}>
        <IconGitMerge stroke={1.5} />
      </ThemeIcon>
    );
  }
};
