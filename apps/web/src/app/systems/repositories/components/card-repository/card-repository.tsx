import { Group, Paper } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import type { FC, ReactNode } from "react";
import classes from "./card-repository.module.css";
import { IconRepository } from "../../../../../providers/icon.provider";

interface CardRepository {
  name: string | ReactNode;
  onClick?: () => void;
}

export const CardRepository: FC<CardRepository> = ({ name, onClick }) => {
  return (
    <Paper
      p="md"
      withBorder
      radius="md"
      className={classes.card}
      onClick={onClick}
    >
      <Group justify="space-between" align="center">
        <Group>
          <IconRepository size={20} stroke={1.5} />
          {name}
        </Group>
        <IconExternalLink stroke={1.5} size={16} />
      </Group>
    </Paper>
  );
};
