import { Portal } from "@mantine/core";
import { FC } from "react";

interface HeaderActionsProps {
  children: React.ReactNode;
}

export const HeaderActions: FC<HeaderActionsProps> = ({ children }) => {
  return <Portal target="#header-actions">{children}</Portal>;
};
