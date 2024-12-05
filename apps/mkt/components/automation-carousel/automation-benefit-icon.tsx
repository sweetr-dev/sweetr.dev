import {
  IconClock,
  IconBug,
  IconShield,
  IconHammer,
  IconAdjustments,
} from "@tabler/icons-react";

type IconType =
  | "cycleTime"
  | "failureRate"
  | "compliance"
  | "security"
  | "techDebt"
  | "prTitle";

interface AutomationIconProps {
  type: IconType;
  color?: string;
  stroke?: number;
}

const getIcon = (type: IconType) => {
  switch (type) {
    case "cycleTime":
      return IconClock;
    case "failureRate":
      return IconBug;
    case "compliance":
      return IconAdjustments;
    case "security":
      return IconShield;
    case "techDebt":
      return IconHammer;
    case "prTitle":
      return IconHammer;
    default:
      throw new Error(`Unknown icon type: ${type}`);
  }
};

const AutomationIcon = ({
  type,
  color = "#fff",
  stroke = 1.5,
  ...props
}: AutomationIconProps) => {
  const IconComponent = getIcon(type);

  return (
    <div className="rounded p-[4px] bg-dark-600 border border-dark-400 flex items-center justify-center w-[28px] h-[28px]">
      <IconComponent color={color} stroke={stroke} {...props} />
    </div>
  );
};

export default AutomationIcon;
