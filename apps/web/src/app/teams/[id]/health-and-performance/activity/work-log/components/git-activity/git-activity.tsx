import { Stack, Group } from "@mantine/core";
import {
  IconHexagonFilled,
  IconMessageCircle2Filled,
} from "@tabler/icons-react";

interface GitActivityProps {
  prCount?: number;
}
export const GitActivity = ({ prCount = 4 }: GitActivityProps) => {
  return (
    <Stack gap={5}>
      <Group gap={5} wrap="nowrap">
        <IconMessageCircle2Filled
          stroke={1.5}
          size={12}
          style={{ color: "var(--mantine-color-gray-4)", opacity: 0.8 }}
        />
        {Array.from({ length: 2 }).map((_, index) => (
          <IconMessageCircle2Filled
            key={index}
            stroke={1.5}
            size={20}
            style={{ color: "var(--mantine-color-gray-4)", opacity: 0.8 }}
          />
        ))}
      </Group>
      <Group gap={5} wrap="nowrap">
        {Array.from({ length: prCount / 2 }).map((_, index) => (
          <IconHexagonFilled
            key={index}
            stroke={1.5}
            size={20}
            style={{ color: "var(--mantine-color-green-4)", opacity: 0.8 }}
          />
        ))}
        <IconHexagonFilled
          stroke={1.5}
          size={32}
          style={{ color: "var(--mantine-color-green-4)", opacity: 0.8 }}
        />
        {Array.from({ length: prCount / 2 }).map((_, index) => (
          <IconHexagonFilled
            key={index}
            stroke={1.5}
            size={20}
            style={{ color: "var(--mantine-color-green-4)", opacity: 0.8 }}
          />
        ))}
      </Group>
      <Group gap={5} wrap="nowrap">
        {Array.from({ length: 2 }).map((_, index) => (
          <IconHexagonFilled
            key={index}
            stroke={1.5}
            size={20}
            style={{ color: "var(--mantine-color-violet-4)", opacity: 0.8 }}
          />
        ))}
      </Group>
    </Stack>
  );
};
