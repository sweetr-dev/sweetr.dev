import { Avatar, AvatarProps } from "@mantine/core";
import { FC } from "react";

interface AvatarUserProps extends AvatarProps {
  name: string;
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

export const AvatarUser: FC<AvatarUserProps> = ({ src, name, ...props }) => {
  return (
    <Avatar src={src} alt={name} radius="xl" {...props}>
      {getInitials(name)}
    </Avatar>
  );
};
