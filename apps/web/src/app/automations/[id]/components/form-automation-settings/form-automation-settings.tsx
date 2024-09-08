import { Automation } from "@sweetr/graphql-types/api";
import { SettingEnable } from "./setting-enable";

interface SettingEnableProps {
  automation: Pick<Automation, "slug" | "enabled">;
}

export const FormAutomationSettings = ({ automation }: SettingEnableProps) => {
  return (
    <>
      <SettingEnable automation={automation} />
    </>
  );
};
