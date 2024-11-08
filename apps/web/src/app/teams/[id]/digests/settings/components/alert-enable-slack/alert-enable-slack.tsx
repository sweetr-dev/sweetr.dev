import { Alert, Group, Button, Text, AlertProps } from "@mantine/core";
import { IconAlertHexagon, IconExternalLink } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const AlertEnableSlack = (props: AlertProps) => {
  return (
    <Alert
      variant="light"
      color="violet"
      styles={{
        wrapper: {
          alignItems: "center",
        },
      }}
      icon={<IconAlertHexagon stroke={1.5} />}
      {...props}
    >
      <Group justify="space-between">
        <Text>Setup integration with Slack to enable this feature.</Text>
        <Button
          size="xs"
          variant="filled"
          component={Link}
          target="_blank"
          to={`/settings/integrations/slack`}
          color="violet"
          rightSection={<IconExternalLink stroke={1.5} size={16} />}
        >
          Enable
        </Button>
      </Group>
    </Alert>
  );
};
