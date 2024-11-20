import { Stack, Group, Text, StackProps } from "@mantine/core";

interface LinesChangedProps extends StackProps {
  deletions: number;
  additions: number;
  files: number;
}

export const LinesChanged = ({
  deletions,
  additions,
  files,
  ...props
}: LinesChangedProps) => {
  return (
    <Stack gap={0} align="center" miw={120} {...props}>
      <Group gap={4} wrap="nowrap">
        <Text c="green.5" fw={500} size="sm">
          +{additions}
        </Text>
        <Text c="red.5" fw={500} size="sm">
          -{deletions}
        </Text>
      </Group>
      <Text
        c="dimmed"
        fw={500}
        size="xs"
        ta="center"
        style={{ whiteSpace: "nowrap" }}
      >
        {files > 1 ? `${files} files` : "1 file"} tracked
      </Text>
    </Stack>
  );
};
