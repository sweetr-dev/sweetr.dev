import { Breadcrumbs } from "../../../components/breadcrumbs";
import { PageContainer } from "../../../components/page-container";

export const IncidentsPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Incidents" }]} />
    </PageContainer>
  );
};
