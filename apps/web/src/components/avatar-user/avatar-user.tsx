import { Avatar, AvatarProps, Tooltip } from "@mantine/core";
import { FC } from "react";

interface AvatarUserProps extends AvatarProps {
  name: string;
  tooltip?: boolean | string;
}

const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(" ");

  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, "");
  return initials;
};

export const AvatarUser: FC<AvatarUserProps> = ({
  src,
  name,
  tooltip,
  ...props
}) => {
  const avatar = (
    <Avatar src={src} alt={name} radius="xl" {...props}>
      {getInitials(name)}
    </Avatar>
  );

  if (!tooltip) {
    return avatar;
  }

  const tooltipLabel = typeof tooltip === "string" ? tooltip : name;

  return (
    <Tooltip label={tooltipLabel} withArrow position="top">
      {avatar}
    </Tooltip>
  );
};
