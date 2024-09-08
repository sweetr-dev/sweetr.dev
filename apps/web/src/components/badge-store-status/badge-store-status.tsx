import { Badge } from "@mantine/core";

interface BadgeStoreStatusProps {
  enabled: boolean;
  available: boolean;
}

export const BadgeStoreStatus = ({
  enabled,
  available,
}: BadgeStoreStatusProps) => {
  if (!available) {
    return (
      <Badge size="lg" color="gray" variant="light" radius="sm">
        Coming Soon
      </Badge>
    );
  }

  if (enabled) {
    return (
      <Badge size="lg" color="green" variant="light" radius="sm">
        Enabled
      </Badge>
    );
  }

  return (
    <Badge size="lg" color="violet" variant="light" radius="sm">
      Available
    </Badge>
  );
};
