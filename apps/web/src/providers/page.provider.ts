import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useEffect } from "react";

interface PageStore {
  fullWidth: boolean;
  containerSize: ContainerSize;
  setFullWidth: (value: boolean) => void;
  setContainerSize: (value: ContainerSize) => void;
}

export const containerSizes = {
  md: undefined,
  lg: 1200,
  xl: 1600,
};

export type ContainerSize = keyof typeof containerSizes;

export const usePageStore = create<PageStore>()(
  devtools(
    (set) => ({
      containerSize: "md" as ContainerSize,
      fullWidth: false,
      setFullWidth: (value: boolean) => set(() => ({ fullWidth: value })),
      setContainerSize: (value: ContainerSize) =>
        set((state) => ({ ...state, containerSize: value })),
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

export const useLargerPageContainer = (size: ContainerSize) => {
  const { setContainerSize } = usePageStore();

  useEffect(() => {
    setContainerSize(size);

    return () => {
      setContainerSize("md");
    };
  }, [size, setContainerSize]);
};
