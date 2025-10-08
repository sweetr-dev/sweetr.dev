import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import {
  showNotification,
  NotificationData,
  useNotifications as useMantineNotifications,
} from "@mantine/notifications";

type Args = Omit<NotificationData, "message"> & {
  message?: string | React.ReactNode;
};

export const errorNotificationProps = {
  title: "Error",
  color: "red",
  withBorder: true,
  message: "",
  icon: <IconX stroke={1.5} />,
};

export const showErrorNotification = (args: Args) =>
  showNotification({
    ...errorNotificationProps,
    ...args,
  });

export const successNotificationProps = {
  title: "Success",
  color: "green",
  withBorder: true,
  message: "",
  icon: <IconCheck stroke={1.5} />,
};

export const showSuccessNotification = (args: Args) =>
  showNotification({
    ...successNotificationProps,
    ...args,
  });

export const showWarningNotification = (args: Args) =>
  showNotification({
    title: "Warning",
    color: "yellow",
    withBorder: true,
    message: "",
    ...args,
  });

export const showInfoNotification = (args: Args) =>
  showNotification({
    title: "Info",
    color: "gray",
    withBorder: true,
    message: "",
    icon: <IconInfoCircle stroke={1.5} />,
    ...args,
  });

export const useNotifications = () => {
  const store = useMantineNotifications();

  return {
    ...store,
    findNotification: (key: string) =>
      store.notifications.filter((notification) => notification.key === key),
  };
};
