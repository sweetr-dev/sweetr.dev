import { Paper, Group, Box, Title, Button, Text } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { useLoginToStripe } from "../../../../../api/billing.api";
import { showErrorNotification } from "../../../../../providers/notification.provider";
import { useWorkspace } from "../../../../../providers/workspace.provider";

export const CardCustomerPortal = () => {
  const { workspace } = useWorkspace();
  const { mutate, isPending } = useLoginToStripe({
    onSuccess: (data) => {
      const redirectUrl = data.loginToStripe;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      showErrorNotification({
        message: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <Paper mt="xs" p="md" withBorder>
      <Group justify="space-between">
        <Box flex="1 1">
          <Title order={5}>Customer Portal</Title>
          <Text c="dimmed" size="sm" display="flex">
            Manage your subscription, payment methods and invoices.
          </Text>
        </Box>

        <Button
          variant="outline"
          loading={isPending}
          rightSection={<IconExternalLink stroke={1.5} size={16} />}
          onClick={() => {
            mutate({ input: { workspaceId: workspace.id } });
          }}
        >
          Stripe
        </Button>
      </Group>
    </Paper>
  );
};
