import { Group, Avatar, Text } from "@mantine/core";
import { forwardRef } from "react";

interface AccountSwitcherItemProps
  extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  avatar?: string;
}

export const AccountSwitcherItem = forwardRef<
  HTMLDivElement,
  AccountSwitcherItemProps
>(function AccountSwitcherItemComponent(
  { avatar, label, ...others }: AccountSwitcherItemProps,
  ref,
) {
  return (
    <div ref={ref} {...others}>
      <Group wrap="nowrap">
        <Avatar src={avatar} size={24} />

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  );
});
