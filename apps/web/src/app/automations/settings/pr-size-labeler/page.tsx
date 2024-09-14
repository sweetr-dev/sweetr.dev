import { Box, Stack, Title, Skeleton, Loader, Group } from "@mantine/core";
import { Breadcrumbs } from "../../../../components/breadcrumbs";
import { PageContainer } from "../../../../components/page-container";
import { LoadableContent } from "../../../../components/loadable-content";
import { AutomationType } from "@sweetr/graphql-types/frontend/graphql";
import { useAutomationSettings } from "../use-automation";
import { useAutomationCards } from "../../use-automation-cards";
import { SettingEnable } from "../components/settings-enable";
import { HeaderAutomation } from "../components/header-automation";
import { SectionBenefits } from "../components/section-benefits/section-benefits";
import { FormPrSizeLabelerSettings } from "./components/form-pr-size-labeler-settings";

export const AutomationPrSizeLabelerPage = () => {
  const { automationSettings, isLoading, isMutating } = useAutomationSettings(
    AutomationType.PR_SIZE_LABELER,
  );
  const { automationCards } = useAutomationCards();
  const automation = automationCards.PR_SIZE_LABELER;

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Automations", href: "/automations" },
          { label: automation?.title || "" },
        ]}
      />

      <Box maw={700}>
        <LoadableContent
          whenLoading={
            <>
              <Skeleton h={50} />
              <Skeleton h={250} mt={26} />
              <Skeleton h={70} mt="lg" />
              <Skeleton h={70} mt="lg" />
            </>
          }
          isLoading={isLoading}
          content={
            <>
              <HeaderAutomation
                icon={automation?.icon}
                title={automation?.title}
                docsUrl={automation?.docsUrl}
                demoUrl={automation?.demoUrl}
                demoImgHeight={136}
                description={automation?.description}
                benefits={
                  automation && (
                    <SectionBenefits benefits={automation.benefits} />
                  )
                }
              />

              <Group justify="space-between" align="center" mt="xl">
                <Title order={5} mb="sm">
                  Setup
                </Title>
                {isMutating && <Loader size="xs" />}
              </Group>
              <Stack>
                {automation && (
                  <>
                    <SettingEnable
                      enabled={automationSettings?.enabled}
                      type={AutomationType.PR_SIZE_LABELER}
                    />

                    <FormPrSizeLabelerSettings
                      settings={automationSettings?.settings || {}}
                    />
                  </>
                )}
              </Stack>
            </>
          }
        />
      </Box>
    </PageContainer>
  );
};
