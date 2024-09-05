import { modals } from "@mantine/modals";
import { Text, useMantineTheme } from "@mantine/core";
import { OpenConfirmModal } from "@mantine/modals/lib/context";
import { ReactNode } from "react";

type ConfirmationModalArgs =
  | (OpenConfirmModal & { label?: string | ReactNode; title?: string })
  | undefined;

export const useConfirmationModal = () => {
  const theme = useMantineTheme();

  return {
    openConfirmationModal: (payload: ConfirmationModalArgs) =>
      modals.openConfirmModal({
        title: (
          <Text fw={500} mr="xs">
            {payload?.title || <>Please confirm your action</>}
          </Text>
        ),
        children: (
          <Text size="sm">
            {payload?.label || <>Are you sure you want to proceed?</>}
          </Text>
        ),
        groupProps: {
          pt: "xs",
          mx: "-md",
          mb: -6,
          px: "md",
          style: { borderTop: `1px solid ${theme.colors.dark[4]}` },
        },
        size: "sm",
        labels: { confirm: "Confirm", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => console.log("Confirmed"),
        ...payload,
      }),
  };
};
