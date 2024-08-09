import { Box, Title } from "@mantine/core";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";
import { Pricing } from "./components/pricing";
import { useWorkspace } from "../../../providers/workspace.provider";
import { usePurchasablePlansQuery } from "../../../api/billing.api";
import { CardCustomerPortal } from "./components/card-customer-portal";

export const BillingPage = () => {
  const { workspace } = useWorkspace();

  const { data, isLoading } = usePurchasablePlansQuery(
    {
      workspaceId: workspace.id,
    },
    { enabled: !workspace.billing?.subscription?.isActive },
  );

  const plans = data?.workspace.billing?.purchasablePlans;

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Settings" }, { label: "Billing" }]} />
      <Box maw={700}>
        <Title order={3} mb="md">
          Billing
        </Title>

        {plans && <Pricing plan={plans.cloud} isLoading={isLoading} />}

        {workspace.billing?.subscription && <CardCustomerPortal />}
      </Box>
    </PageContainer>
  );
};
