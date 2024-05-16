import {
  ThemeIcon,
  ThemeIconProps,
  Tooltip,
  TooltipProps,
} from "@mantine/core";
import { FC } from "react";
import { IconInfoCircle } from "@tabler/icons-react";

interface IconInfoProps extends Omit<ThemeIconProps, "children"> {
  tooltip: string;
  position?: TooltipProps["position"];
}

export const IconInfo: FC<IconInfoProps> = ({
  tooltip,
  position = "right",
  ...props
}) => {
  return (
    <Tooltip label={tooltip} position={position} withArrow>
      <ThemeIcon
        variant="transparent"
        color="gray"
        radius="xl"
        size="xs"
        {...props}
      >
        <IconInfoCircle stroke={1.5} />
      </ThemeIcon>
    </Tooltip>
  );
};
