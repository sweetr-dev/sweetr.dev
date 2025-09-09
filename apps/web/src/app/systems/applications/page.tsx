import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";

export const ApplicationsPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Applications" }]} />
    </PageContainer>
  );
};
