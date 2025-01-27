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
      <Badge color="gray" variant="light" {...props}>
        Coming Soon
      </Badge>
    );
  }

  if (enabled) {
    return (
      <Badge color="green" variant="light" {...props}>
        On
      </Badge>
    );
  }

  return (
    <Badge color="violet" variant="light" {...props}>
      Off
    </Badge>
  );
};
