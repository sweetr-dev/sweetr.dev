import { Text, Paper, Group } from "@mantine/core";
import classes from "./card-stat.module.css";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconProps,
} from "@tabler/icons-react";

interface CardStatProps {
  name: string;
  amount: string;
  previous: number;
  change: number;
  changePrefix?: boolean;
  icon: React.ComponentType<IconProps>;
}

export const CardStat = ({
  name,
  amount,
  change,
  previous,
  changePrefix = false,
  icon: Icon,
}: CardStatProps) => {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {name}
        </Text>
        <Icon className={classes.icon} size={24} stroke={1.5} />
      </Group>

      <Group align="flex-end" gap="xs" mt={20}>
        <Text className={classes.value} fz="md" c="white" fw={500}>
          {amount}
        </Text>
      </Group>

      <Group gap={4} align="center" mt="xs" h={21}>
        {!!previous && (
          <Text
            c={change >= 0 ? "teal" : "red"}
            fz="sm"
            fw={500}
            className={classes.diff}
          >
            <span>
              {changePrefix && (change >= 0 ? "+" : "")}
              {change}%
            </span>
            {change >= 0 ? (
              <IconArrowUpRight size="1rem" stroke={1.5} />
            ) : (
              <IconArrowDownRight size="1rem" stroke={1.5} />
            )}
          </Text>
        )}
        <Text fz="xs" c="dimmed">
          {previous
            ? "Compared to previous UTC period."
            : "No data to compare."}
        </Text>
      </Group>
    </Paper>
  );
};
