import { objectify } from "radash";
import { ReactNode, useEffect, useState } from "react";

interface UseSeenOptionsCacheProps {
  memoizedItems: { label: string; value: string; icon?: string | ReactNode }[];
}

export const useSeenOptionsCache = ({
  memoizedItems,
}: UseSeenOptionsCacheProps) => {
  const [seenOptions, setSeenOptionsCache] = useState<
    Record<string, (typeof memoizedItems)[number]>
  >({});

  useEffect(() => {
    if (memoizedItems?.length) {
      setSeenOptionsCache((prev) => ({
        ...prev,
        ...objectify(
          memoizedItems,
          (i) => i.value,
          (i) => i,
        ),
      }));
    }
  }, [memoizedItems]);

  return seenOptions;
};
