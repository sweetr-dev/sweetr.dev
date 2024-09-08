import { Title, Stack, Paper, Group } from "@mantine/core";
import { benefitLabels } from "../../../../../providers/automation.provider";
import {
  IconAutomationBenefit,
  AutomationBenefit,
} from "../../../components/icon-automation-benefit";

interface SectionBenefitsProps {
  benefits: Record<string, string>;
}
export const SectionBenefits = ({ benefits }: SectionBenefitsProps) => {
  return (
    <>
      <Stack gap="xs" mt="md">
        {Object.entries(benefits).map(
          ([key, value]) =>
            value && (
              <Paper withBorder p="sm" key={key}>
                <Group wrap="nowrap">
                  <IconAutomationBenefit
                    benefit={key as AutomationBenefit}
                    themeIconProps={{
                      size: "xl",
                      variant: "light",
                    }}
                    showTooltip={false}
                    iconProps={{ size: "24" }}
                  />
                  <div>
                    <strong>{benefitLabels[key as AutomationBenefit]}:</strong>{" "}
                    {value}
                  </div>
                </Group>
              </Paper>
            ),
        )}
      </Stack>
    </>
  );
};
