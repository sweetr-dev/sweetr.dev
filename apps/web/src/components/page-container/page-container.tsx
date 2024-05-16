import { Container } from "@mantine/core";
import type { ReactNode } from "react";

interface PageContainerProps {
  children?: ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <Container pt={48} pb={48}>
      {children}
    </Container>
  );
};
