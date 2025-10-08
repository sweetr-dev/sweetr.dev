import { useRef } from "react";

export const useRunOnce = (): [boolean, () => void] => {
  const hasRun = useRef(false);

  return [
    hasRun.current,
    () => {
      hasRun.current = true;
    },
  ];
};
