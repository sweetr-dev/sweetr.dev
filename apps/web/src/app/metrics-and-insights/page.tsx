import { Breadcrumbs } from "../../components/breadcrumbs";
import { useWorkspace } from "../../providers/workspace.provider";
import { PageContainer } from "../../components/page-container";

export const MetricsAndInsightsPage = () => {
  const { workspace } = useWorkspace();

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Metrics & Insights" }]} />
    </PageContainer>
  );
};
