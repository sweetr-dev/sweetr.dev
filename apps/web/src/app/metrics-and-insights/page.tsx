import { Breadcrumbs } from "../../components/breadcrumbs";
import { PageContainer } from "../../components/page-container";

export const MetricsAndInsightsPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Metrics & Insights" }]} />
    </PageContainer>
  );
};
