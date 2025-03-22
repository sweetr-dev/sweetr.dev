import {
  Breadcrumbs as MantineBreadcrumbs,
  BreadcrumbsProps as MantineBreadcrumbsProps,
  Portal,
  Anchor,
  Group,
  Badge,
} from "@mantine/core";
import { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../providers/app.provider";
import { useScreenSize } from "../../providers/screen.provider";

interface BreadcrumbsProps extends Omit<MantineBreadcrumbsProps, "children"> {
  items: {
    label: string;
    href?: string;
  }[];
  children?: ReactNode;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items, children }) => {
  const navigate = useNavigate();
  const { workspace } = useAppStore();
  const { isSmallScreen } = useScreenSize();

  return (
    <Portal target="#breadcrumbs">
      <Group gap="xs" wrap="nowrap">
        <MantineBreadcrumbs separator="/">
          {workspace && !isSmallScreen && (
            <Badge color="dark.6" variant="filled">
              {workspace?.name}
            </Badge>
          )}
          {items.map((item, index) => {
            if (item.href) {
              return (
                <Anchor
                  onClick={() => item.href && navigate(item.href)}
                  key={index}
                >
                  <Badge color="dark.6" variant="filled" c="green.4" maw={300}>
                    {item.label}
                  </Badge>
                </Anchor>
              );
            }

            return (
              <Badge color="dark.6" variant="filled" key={index} maw={300}>
                {item.label}{" "}
              </Badge>
            );
          })}
        </MantineBreadcrumbs>
        {children}
      </Group>
    </Portal>
  );
};
