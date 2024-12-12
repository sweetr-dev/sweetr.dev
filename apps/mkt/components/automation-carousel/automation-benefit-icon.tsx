"use client";

import React, { ReactElement } from "react";
import {
  IconClock,
  IconBug,
  IconShield,
  IconHammer,
  IconAdjustments,
  IconKeyboard,
  IconClockBolt,
  IconKeyboardHide,
  IconLock,
  IconGavel,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
  tooltipText?: string;
}

const icons: Record<IconType, ReactElement> = {
  cycleTime: <IconClockBolt />,
  failureRate: <IconBug />,
  compliance: <IconGavel />,
  security: <IconLock />,
  techDebt: <IconKeyboardHide />,
  prTitle: <IconHammer />,
};

export const AutomationIcon = ({
  type,
  color = "#fff",
  stroke = 1.5,
  tooltipText = "",
  ...props
}: AutomationIconProps) => {
  const IconComponent = icons[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded p-[4px] bg-dark-600 border border-dark-400 flex items-center justify-center w-[28px] h-[28px]">
            {React.cloneElement(IconComponent, { color, stroke, ...props })}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {type === "cycleTime" && <>Improves cycle time</>}
          {type === "compliance" && <>Improves compliance</>}
          {type === "failureRate" && <>Improves failure rate</>}
          {type === "security" && <>Improves security</>}
          {type === "techDebt" && <>Improves tech debt</>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
