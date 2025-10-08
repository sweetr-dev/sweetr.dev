import { Stack, StackProps } from "@mantine/core";
import { useSubnav } from "../../providers/nav.provider";
import classes from "./subnav.module.css";
export const Subnav = ({ children, ...props }: StackProps) => {
  useSubnav();

  return (
    <Stack
      h="100%"
      pt={10}
      style={{ flexGrow: 1, flexWrap: "nowrap" }}
      gap={4}
      p="md"
      {...props}
      className={classes.subnav}
    >
      {children}
    </Stack>
  );
};
