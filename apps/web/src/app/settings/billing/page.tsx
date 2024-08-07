import { Box, Button, Group, Paper, Title, Text } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { Pricing } from "./components/pricing";
import { IconExternalLink } from "@tabler/icons-react";

export const BillingPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Billing" }]} />
      <Box maw={700}>
        <Title order={3} mb="md">
          Billing
        </Title>

        <Pricing />

        <Paper mt="xs" p="md" withBorder>
          <Group justify="space-between">
            <Box flex="1 1">
              <Title order={5}>Customer Portal</Title>
              <Text c="dimmed" size="sm" display="flex">
                Manage your subscriptions, payment methods and invoices.
              </Text>
            </Box>

            <Button
              variant="outline"
              rightSection={<IconExternalLink stroke={1.5} size={16} />}
            >
              Stripe
            </Button>
          </Group>
        </Paper>
      </Box>
    </PageContainer>
  );
};
