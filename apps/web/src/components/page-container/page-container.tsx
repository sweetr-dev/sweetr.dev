import { Container } from "@mantine/core";
import type { ReactNode } from "react";
import { usePageStore } from "../../providers/page.provider";
import { useScreenSize } from "../../providers/screen.provider";
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
  const { fullWidth } = usePageStore();
  const { isSmallScreen } = useScreenSize();

  return (
    <Container
      fluid={fullWidth}
      pt={pt}
      pb={pb}
      px={fullWidth && !isSmallScreen ? "xl" : undefined}
    >
      {children}
    </Container>
  );
};
