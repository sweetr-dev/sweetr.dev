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
      <Badge size="lg" color="gray" variant="light">
        Coming Soon
      </Badge>
    );
  }
  if (enabled) {
    return (
      <Badge size="lg" color="green" variant="light">
        Installed
      </Badge>
    );
  }

  return (
    <Badge size="lg" color="violet" variant="light">
      Install
    </Badge>
  );
};
