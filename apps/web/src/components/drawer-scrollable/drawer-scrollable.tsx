import {
  CloseButton,
  Divider,
  Drawer,
  DrawerProps,
  Group,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { FormEventHandler } from "react";

export interface DrawerScrollableProps extends Omit<DrawerProps, "onSubmit"> {
  children: React.ReactNode;
  actions?: React.ReactNode;
  onSubmit?: FormEventHandler;
  toolbar?: React.ReactNode;
}

export const DrawerScrollable = ({
  children,
  title,
  actions,
  onClose,
  onSubmit,
  toolbar,
  ...props
}: DrawerScrollableProps) => {
  const formWrapper = onSubmit ? { component: "form", onSubmit } : undefined;

  return (
    <Drawer.Root
      onClose={onClose}
      {...props}
      styles={{
        body: { padding: "0" },
        content: {
          borderLeft: "1px solid var(--mantine-color-dark-4)",
        },
      }}
    >
      <Drawer.Overlay blur={4} />
      <Drawer.Content>
        <Stack {...formWrapper} gap={0}>
          <Group p="md" justify="space-between">
            <Title order={1} size="h3">
              {title}
            </Title>

            <Group justify="flex-end" align="center">
              {toolbar}
              <CloseButton
                title="Close"
                size={36}
                iconSize={20}
                onClick={onClose}
              />
            </Group>
          </Group>
          <Divider />

          <ScrollArea
            data-autofocus
            style={{
              height: actions ? "calc(100vh - 138px)" : "calc(100vh - 69px)",
            }}
            type="auto"
          >
            {children}
          </ScrollArea>

          {actions && (
            <>
              <Divider />
              <Group
                p="md"
                justify="right"
                style={(theme) => ({ background: theme.colors.dark[6] })}
              >
                {actions}
              </Group>
            </>
          )}
        </Stack>
      </Drawer.Content>
    </Drawer.Root>
  );
};
