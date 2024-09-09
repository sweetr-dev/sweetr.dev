import { Group, Input, Paper, Stack, Text } from "@mantine/core";
import { isString } from "radash";
import { ReactNode } from "react";

interface BoxSettingProps {
  left: string | ReactNode;
  description?: string;
  children: ReactNode;
}

export const BoxSetting = ({
  left,
  description,
  children,
}: BoxSettingProps) => {
  const leftElement = isString(left) ? <Text fz="lg">{left}</Text> : left;

  return (
    <Paper withBorder p="sm">
      <Input.Label w="100%">
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
      </Input.Label>
    </Paper>
  );
};
