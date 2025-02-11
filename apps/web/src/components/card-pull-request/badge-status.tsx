import { Group, Text } from "@mantine/core";
import { TablerIconsProps } from "@tabler/icons-react";

interface BadgeStatusProps {
  variant?: "success" | "warning" | "error" | "default";
  children: React.ReactNode;
  icon: React.ComponentType<TablerIconsProps>;
}

const getLabelColor = (variant: BadgeStatusProps["variant"]) => {
  if (variant === "warning") return "var(--mantine-color-yellow-6)";
  if (variant === "error") return "var(--mantine-color-red-4)";

  return "var(--mantine-color-dark-1)";
};

const getIconColor = (variant: BadgeStatusProps["variant"]) => {
  if (variant === "success") return "var(--mantine-color-green-5)";
  if (variant === "warning") return "var(--mantine-color-yellow-6)";
  if (variant === "error") return "var(--mantine-color-red-4)";

  return "var(--mantine-color-dark-1)";
};

export const BadgeStatus = ({
  variant = "default",
  icon: Icon,
  children,
}: BadgeStatusProps) => {
  return (
    <Group justify="center" align="center" gap={5} py={2}>
      <Icon color={getIconColor(variant)} size={20} stroke={1.5} />
      <Text size="sm" fw={500} c={getLabelColor(variant)}>
        {children}
      </Text>
    </Group>
  );
};
