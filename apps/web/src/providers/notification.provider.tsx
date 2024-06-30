import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { showNotification, NotificationData } from "@mantine/notifications";

type Args = Omit<NotificationData, "message"> & {
  message?: string;
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
