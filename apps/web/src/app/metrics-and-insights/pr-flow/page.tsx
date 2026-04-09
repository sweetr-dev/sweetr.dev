import { Breadcrumbs } from "../../../components/breadcrumbs";
import { IconInfo } from "../../../components/icon-info";
import { PageContainer } from "../../../components/page-container";

export const PrFlowPage = () => {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "PR Flow" }]}>
        <IconInfo tooltip="This list is automatically synced with GitHub." />
      </Breadcrumbs>
    </PageContainer>
  );
};
