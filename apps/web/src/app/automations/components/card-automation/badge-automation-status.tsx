import { Badge } from "@mantine/core";

interface BadgeAutomationStatusProps {
  enabled: boolean;
  available: boolean;
}

export const BadgeAutomationStatus = ({
  enabled,
  available,
}: BadgeAutomationStatusProps) => {
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
        On
      </Badge>
    );
  }

  return (
    <Badge size="lg" color="red" variant="light">
      Off
    </Badge>
  );
};
