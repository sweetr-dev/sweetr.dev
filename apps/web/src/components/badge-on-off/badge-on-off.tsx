import { Badge, BadgeProps } from "@mantine/core";

interface BadgeOnOffProps extends BadgeProps {
  enabled: boolean;
  available: boolean;
}

export const BadgeOnOff = ({
  enabled,
  available,
  ...props
}: BadgeOnOffProps) => {
  if (!available) {
    return (
      <Badge radius="sm" size="lg" color="gray" variant="light" {...props}>
        Coming Soon
      </Badge>
    );
  }

  if (enabled) {
    return (
      <Badge radius="sm" size="lg" color="green" variant="light" {...props}>
        On
      </Badge>
    );
  }

  return (
    <Badge radius="sm" size="lg" color="violet" variant="light" {...props}>
      Off
    </Badge>
  );
};
