import {
  Container,
  Group,
  AppShell,
  useMantineTheme,
  Burger,
} from "@mantine/core";

interface HeaderProps {
  onToggleMenu: () => void;
  isMobileNavOpen: boolean;
  isMobile: boolean;
}

export const Header = ({
  onToggleMenu,
  isMobileNavOpen,
  isMobile,
}: HeaderProps): React.ReactElement => {
  const theme = useMantineTheme();

  return (
    <AppShell.Header px={0} bg={theme.colors.dark[8]}>
      <Group
        justify="space-between"
        align="center"
        h="100%"
        w="100%"
        wrap="nowrap"
      >
        {isMobile && (
          <Burger
            onClick={() => onToggleMenu()}
            opened={isMobileNavOpen}
            size="sm"
            color={theme.colors.gray[6]}
            ml="xs"
          />
        )}

        <Container
          w={isMobile ? undefined : "100%"}
          m={isMobile ? 0 : undefined}
        >
          <Group
            justify="space-between"
            wrap="nowrap"
            style={{ width: "100%", height: "100%" }}
          >
            <div id="breadcrumbs"></div>
            <div id="header-actions"></div>
          </Group>
        </Container>
      </Group>
    </AppShell.Header>
  );
};
