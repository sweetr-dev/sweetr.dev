import { Alert, Box, Title } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";

export const BillingPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Billing" }]} />

      <Box maw={600}>
        <Title order={3}>Billing</Title>
        <Alert
          variant="light"
          color="blue"
          title="Coming soon."
          mt="xs"
          icon={<IconInfoCircle stroke={1.5} />}
        >
          Enjoy all features for free during our open beta period.
        </Alert>
      </Box>
    </PageContainer>
  );
};
