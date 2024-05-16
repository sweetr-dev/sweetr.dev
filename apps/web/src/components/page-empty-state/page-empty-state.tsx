import { Button, Stack, Text } from "@mantine/core";
import { IconFilterX, IconStack2 } from "@tabler/icons-react";
import type { FC } from "react";

interface PageEmptyStateProps {
  message: string;
  isFiltering?: boolean;
  action?: string;
  icon?: React.ComponentType<{
    stroke: number;
    size: number;
  }>;
  onClick?: () => void;
  onResetFilter?: () => void;
}

export const PageEmptyState: FC<PageEmptyStateProps> = ({
  message,
  action,
  onClick,
  isFiltering = false,
  icon,
  onResetFilter,
}) => {
  const Icon = icon ? icon : isFiltering ? IconFilterX : IconStack2;

  return (
    <Stack align="center" gap={0}>
      <Icon stroke={0.5} size={90} />

      <Text c="dimmed" size="lg">
        {isFiltering ? "No results found" : message}
      </Text>

      {action && !isFiltering && (
        <Button mt={20} variant="outline" size="md" onClick={onClick}>
          {action}
        </Button>
      )}

      {onResetFilter && isFiltering && (
        <Button mt={20} variant="outline" size="md" onClick={onResetFilter}>
          Reset filters
        </Button>
      )}
    </Stack>
  );
};
