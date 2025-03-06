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
      <ThemeIcon color="green" variant="light" radius="xl" size={46}>
        <IconCheck stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === CodeReviewState.COMMENTED) {
    return (
      <ThemeIcon color="blue" variant="light" radius="xl" size={46}>
        <IconMessageCircle stroke={1.5} />
      </ThemeIcon>
    );
  }

  if (state === CodeReviewState.CHANGES_REQUESTED) {
    return (
      <ThemeIcon color="red" variant="light" radius="xl" size={46}>
        <IconMessageExclamation stroke={1.25} />
      </ThemeIcon>
    );
  }
};
