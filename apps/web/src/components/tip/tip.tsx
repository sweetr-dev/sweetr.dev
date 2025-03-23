import { Group, GroupProps, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

type TipProps = GroupProps;

export const Tip = ({ children, ...props }: TipProps) => {
  return (
    <Group gap={5} {...props}>
      <IconInfoCircle stroke={1.5} size={16} />
      <Text size="xs" c="dimmed">
        Tip: {children}
      </Text>
    </Group>
  );
};
