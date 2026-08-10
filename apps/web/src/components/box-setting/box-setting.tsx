import { Group, Input, Paper, PaperProps, Stack, Text } from "@mantine/core";
import { isString } from "radash";
import { ReactNode } from "react";

interface BoxSettingProps extends PaperProps {
  label: string | ReactNode;
  description?: string;
  children: ReactNode;
  surface?: "page" | "drawer";
}

export const BoxSetting = ({
  label,
  description,
  children,
  surface = "drawer",
}: BoxSettingProps) => {
  const leftElement = isString(label) ? <Text fz="lg">{label}</Text> : label;

  return (
    <Input.Label w="100%">
      <Paper withBorder p="sm" bg={surface === "page" ? "dark.7" : "dark.6"}>
        <Group gap="xl" wrap="nowrap" justify="space-between" align="center">
          <Stack gap={5} justify="center">
            {leftElement}
            {description && (
              <Text fz="sm" c="dimmed">
                {description}
              </Text>
            )}
          </Stack>
          {children}
        </Group>
      </Paper>
    </Input.Label>
  );
};
