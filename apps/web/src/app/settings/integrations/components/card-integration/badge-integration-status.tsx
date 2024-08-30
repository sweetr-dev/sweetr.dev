import { Badge } from "@mantine/core";

interface BadgeIntegrationStatusProps {
  enabled: boolean;
  available: boolean;
}

export const BadgeIntegrationStatus = ({
  enabled,
  available,
}: BadgeIntegrationStatusProps) => {
  if (!available) {
    return (
      <Badge size="lg" color="gray" variant="light" radius="sm">
        Coming Soon
      </Badge>
    );
  }
  if (enabled) {
    return (
      <Badge size="lg" color="violet" variant="light" radius="sm">
        Installed
      </Badge>
    );
  }

  return (
    <Badge size="lg" color="green" variant="light" radius="sm">
      Install
    </Badge>
  );
};
