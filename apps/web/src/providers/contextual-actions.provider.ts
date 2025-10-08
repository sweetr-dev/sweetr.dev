import { SpotlightActionData } from "@mantine/spotlight";
import { IconProps } from "@tabler/icons-react";
import React, { useEffect } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type Action = Omit<SpotlightActionData, "id"> & {
  icon: React.ComponentType<IconProps>;
};

interface AppStore {
  actions: Record<string, Action>;
  mergeActions: (actions: Record<string, Action>) => void;
  clearActions: () => void;
}

export const useContextualActionsStore = create<AppStore>()(
  devtools((set) => ({
    actions: {},
    mergeActions: (newActions: Record<string, Action>) =>
      set((state) => ({ actions: { ...state.actions, ...newActions } })),
    clearActions: () => set({ actions: {} }),
  })),
);

export const useContextualActions = (
  actions: Record<string, Action>,
  dependencies: unknown[] = [],
  isRootPage = true, // Pass false if calling from a child component of a page
) => {
  const { mergeActions, clearActions } = useContextualActionsStore();

  useEffect(() => {
    mergeActions(actions);

    return () => {
      if (isRootPage) clearActions();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRootPage, mergeActions, clearActions, ...dependencies]);
};
