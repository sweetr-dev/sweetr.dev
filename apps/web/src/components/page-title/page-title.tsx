import { Group, Space, Title } from "@mantine/core";
import type { FC, ReactNode } from "react";

interface PageTitleProps {
  title: string | ReactNode;
  children?: ReactNode;
}

export const PageTitle: FC<PageTitleProps> = ({ title, children }) => {
  const titleElement =
    typeof title === "string" ? (
      <Title order={1} size="h2">
        {title}
      </Title>
    ) : (
      title
    );

  return (
    <>
      <Group justify="space-between" mb="xs" align="center">
        {titleElement}
        {children}
      </Group>
    </>
  );
};
