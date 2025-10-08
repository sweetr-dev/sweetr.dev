import { Avatar, Tooltip } from "@mantine/core";
import type { FC } from "react";
import type React from "react";

interface TeamMemberAvatarProps {
  name: string;
  src?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const TeamMemberAvatar: FC<TeamMemberAvatarProps> = ({
  src,
  name,
  ...props
}) => {
  return (
    <Tooltip label={name} withArrow>
      <Avatar size={36} src={src} radius="xl" alt={name} {...props} />
    </Tooltip>
  );
};
