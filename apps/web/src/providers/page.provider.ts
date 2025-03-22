import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useEffect } from "react";

interface PageStore {
  fullWidth: boolean;
  setFullWidth: (value: boolean) => void;
}

export const usePageStore = create<PageStore>()(
  devtools(
    (set) => ({
      fullWidth: false,
      setFullWidth: (value: boolean) => set(() => ({ fullWidth: value })),
    }),
    { name: "page-store" },
  ),
);

export const useFullWidthPage = () => {
  const { setFullWidth } = usePageStore();

  useEffect(() => {
    setFullWidth(true);

    return () => {
      setFullWidth(false);
    };
  }, [setFullWidth]);
};
