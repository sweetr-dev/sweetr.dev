import React from "react";
import { TablerIconsProps } from "@tabler/icons-react";

interface AutomationIconProps extends TablerIconsProps {
  IconComponent: React.FC<TablerIconsProps>;
}

const AutomationIcon: React.FC<AutomationIconProps> = ({
  IconComponent,
  color = "#fff",
  stroke = 1.5,
  ...props
}) => {
  return (
    <div className="rounded p-[4px] bg-dark-600 border border-dark-400 flex items-center justify-center w-[28px] h-[28px]">
      <IconComponent color={color} stroke={stroke} {...props} />
    </div>
  );
};

export default AutomationIcon;
