import { Container } from "@mantine/core";
import type { ReactNode } from "react";
import { usePageStore } from "../../providers/page.provider";
import { useScreenSize } from "../../providers/screen.provider";
interface PageContainerProps {
  children?: ReactNode;
  pt?: number;
  pb?: number;
  size?: "md" | "lg" | "xl";
}

const containerSizes = {
  md: undefined,
  lg: 1200,
  xl: 1600,
};

export const PageContainer = ({
  children,
  pt = 40,
  pb = 40,
  size = "md",
}: PageContainerProps) => {
  const { fullWidth } = usePageStore();
  const { isSmallScreen } = useScreenSize();

  return (
    <Container
      fluid={fullWidth}
      pt={pt}
      pb={pb}
      px={fullWidth && !isSmallScreen ? "xl" : undefined}
      maw={containerSizes[size]}
    >
      {children}
    </Container>
  );
};
