import { Container } from "@mantine/core";
import type { ReactNode } from "react";

interface PageContainerProps {
  children?: ReactNode;
  pt?: number;
  pb?: number;
}

export const PageContainer = ({
  children,
  pt = 48,
  pb = 48,
}: PageContainerProps) => {
  return (
    <Container pt={pt} pb={pb}>
      {children}
    </Container>
  );
};
