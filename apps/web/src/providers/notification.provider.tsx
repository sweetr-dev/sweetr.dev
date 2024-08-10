import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { showNotification, NotificationData } from "@mantine/notifications";
import { getThemeColor, useMantineTheme } from "@mantine/core";

type Args = Omit<NotificationData, "message"> & {
  message?: string | React.ReactNode;
};

export const showErrorNotification = (args: Args): void => {
  showNotification({
    title: "Error",
    color: "red",
    withBorder: true,
    message: "",
    icon: <IconX stroke={1.5} />,
    ...args,
  });
};

export const showSuccessNotification = (args: Args): void => {
  showNotification({
    title: "Success",
    color: "green",
    withBorder: true,
    message: "",
    icon: <IconCheck stroke={1.5} />,
    ...args,
  });
};

export const showWarningNotification = (args: Args): void => {
  showNotification({
    title: "Warning",
    color: "yellow",
    withBorder: true,
    message: "",
    ...args,
  });
};

export const showInfoNotification = (args: Args): void => {
  showNotification({
    title: "Info",
    color: "gray",
    withBorder: true,
    message: "",
    icon: <IconInfoCircle stroke={1.5} />,
    ...args,
  });
};
