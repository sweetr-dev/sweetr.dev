import { Group, Input, Paper, PaperProps, Stack, Text } from "@mantine/core";
import { isString } from "radash";
import { ReactNode } from "react";

interface BoxSettingProps extends PaperProps {
  label: string | ReactNode;
  description?: string;
  children: ReactNode;
}

export const BoxSetting = ({
  label,
  description,
  children,
}: BoxSettingProps) => {
  const leftElement = isString(label) ? <Text fz="lg">{label}</Text> : label;

  return (
    <Input.Label w="100%">
      <Paper withBorder p="sm" bg="dark.6">
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
