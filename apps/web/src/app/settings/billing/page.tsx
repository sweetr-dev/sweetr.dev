import { Box, Title } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { Pricing, PricingSkeleton } from "./components/pricing";
import { useWorkspace } from "../../../providers/workspace.provider";
import { useBillingQuery } from "../../../api/billing.api";
import { CardCustomerPortal } from "./components/card-customer-portal";

export const BillingPage = () => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = useBillingQuery(
    {
      workspaceId: workspace.id,
    },
    { enabled: !workspace.billing?.subscription?.isActive },
  );

  const billing = data?.workspace.billing;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Billing" }]} />
      <Box maw={700}>
        <Title order={3} mb="md">
          Billing
        </Title>

        {isLoading && <PricingSkeleton />}

        {billing?.purchasablePlans && (
          <Pricing
            plan={billing.purchasablePlans?.cloud}
            currentUsage={billing.estimatedSeats}
          />
        )}

        {workspace.billing?.subscription && <CardCustomerPortal />}
      </Box>
    </PageContainer>
  );
};
