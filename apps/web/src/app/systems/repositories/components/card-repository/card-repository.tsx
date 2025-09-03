import { Group, Paper } from "@mantine/core";
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";
import type { FC, ReactNode } from "react";
import classes from "./card-repository.module.css";

interface CardRepository {
  name: string | ReactNode;
  onClick?: () => void;
}

export const CardRepository: FC<CardRepository> = ({ name, onClick }) => {
  return (
    <Paper p="sm" className={classes.card} onClick={onClick}>
      <Group justify="space-between" align="center">
        <Group>
          <IconBrandGithub size={24} stroke={1.5} />
          {name}
        </Group>
        <IconExternalLink stroke={1.5} size={20} />
      </Group>
    </Paper>
  );
};
