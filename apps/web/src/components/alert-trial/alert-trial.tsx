import { Box, BoxProps, Button, Group, Text } from "@mantine/core";
import { IconAlertHexagon } from "@tabler/icons-react";
import classes from "./alert-trial.module.css";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../providers/workspace.provider";
import { parseISO } from "date-fns";
import { getDaysLeft } from "../../providers/date.provider";

interface AlertTrialProps extends BoxProps {}

export const AlertTrial = ({ ...props }: AlertTrialProps) => {
  const { workspace } = useWorkspace();

  if (!workspace.billing?.trial) return null;

  const daysLeft = getDaysLeft(parseISO(workspace.billing.trial.endAt));

  if (daysLeft === null) return null;

  const isAboutToExpire = daysLeft < 2;

  return (
    <Box
      p="md"
      {...props}
      className={isAboutToExpire ? classes["alert-warning"] : classes.alert}
    >
      <Group justify="space-between">
        <Group gap="xs">
          <IconAlertHexagon stroke={1.5} />
          <Text fw={700} size="sm">
            You have {daysLeft} {daysLeft === 1 ? "day" : "days"} left on your
            trial.
          </Text>
        </Group>
        <Link to="/settings/billing">
          <Button
            variant="filled"
            size="xs"
            autoContrast
            color={isAboutToExpire ? "yellow.4" : "violet"}
          >
            Upgrade now
          </Button>
        </Link>
      </Group>
    </Box>
  );
};
