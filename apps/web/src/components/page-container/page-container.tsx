import { Container } from "@mantine/core";
import type { ReactNode } from "react";
import { containerSizes, usePageStore } from "../../providers/page.provider";
import { useScreenSize } from "../../providers/screen.provider";

interface PageContainerProps {
  children?: ReactNode;
  pt?: number;
  pb?: number;
}

export const PageContainer = ({
  children,
  pt = 40,
  pb = 40,
}: PageContainerProps) => {
  const { fullWidth } = usePageStore();
  const { isSmallScreen } = useScreenSize();
  const { containerSize } = usePageStore();

  return (
    <Container
      fluid={fullWidth}
      pt={pt}
      pb={pb}
      px={fullWidth && !isSmallScreen ? "xl" : undefined}
      maw={containerSizes[containerSize]}
    >
      {children}
    </Container>
  );
};
