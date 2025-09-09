import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";

export const DeploymentsPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Deployments" }]} />
    </PageContainer>
  );
};
