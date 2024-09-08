import { Group, Text } from "@mantine/core";
import { ReactNode } from "react";

interface BoxSettingProps {
  label: string;
  children: ReactNode;
}

export const BoxSetting = ({ label, children }: BoxSettingProps) => {
  return (
    <Group wrap="nowrap" justify="space-between" px="sm">
      <Text fw={500} fz="lg">
        {label}
      </Text>
      {children}
    </Group>
  );
};
