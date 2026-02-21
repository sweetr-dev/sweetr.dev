import { Text, Divider, Stack } from "@mantine/core";
import { ImageDemo } from "../image-demo";
import { SectionBenefits } from "../section-benefits/section-benefits";
import { AutomationCard } from "../../../use-automation-cards";

interface HeaderAutomationProps {
  automation: AutomationCard;
}

export const HeaderAutomation = ({ automation }: HeaderAutomationProps) => {
  return (
    <>
      <Stack p="md">
        {automation.demoUrl && (
          <ImageDemo title={automation.title} src={automation.demoUrl} />
        )}

        <Text>{automation.description}</Text>
        <SectionBenefits benefits={automation.benefits} />
      </Stack>
      <Divider my="md" />
    </>
  );
};
