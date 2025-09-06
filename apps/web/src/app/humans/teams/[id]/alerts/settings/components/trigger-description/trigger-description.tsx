import { Group, Paper, Text } from "@mantine/core";
import { IconCalendar, IconWebhook } from "@tabler/icons-react";

interface TriggerDescriptionProps {
  type: "cron" | "event";
  label: string;
}

export const TriggerDescription = ({
  type,
  label,
}: TriggerDescriptionProps) => {
  return (
    <Paper withBorder p="xs">
      <Group gap="xs" align="center">
        {type === "cron" && <IconCalendar stroke={1.5} size={20} />}
        {type === "event" && <IconWebhook stroke={1.5} size={20} />}
        <div>
          <Text fw={500}>
            {type === "cron" ? "Cron-based: " : "Event-based: "}
            <Text component="span">
              {type === "cron" ? "Runs checks " : "Runs when "}
              {label}.
            </Text>
          </Text>
        </div>
      </Group>
    </Paper>
  );
};
