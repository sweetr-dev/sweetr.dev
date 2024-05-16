import { ThemeIcon } from "@mantine/core";
import {
  IconCheck,
  IconMessageCircle,
  IconMessageExclamation,
} from "@tabler/icons-react";
import { CodeReviewState } from "@sweetr/graphql-types/frontend/graphql";

export const IconCodeReview = ({ state }: { state: CodeReviewState }) => {
  if (state === CodeReviewState.APPROVED) {
    return (
      <ThemeIcon color="green" variant="light" size="xl">
        <IconCheck />
      </ThemeIcon>
    );
  }

  if (state === CodeReviewState.COMMENTED) {
    return (
      <ThemeIcon color="blue" variant="light" size="xl">
        <IconMessageCircle />
      </ThemeIcon>
    );
  }

  if (state === CodeReviewState.CHANGES_REQUESTED) {
    return (
      <ThemeIcon color="red" variant="light" size="xl">
        <IconMessageExclamation />
      </ThemeIcon>
    );
  }
};
