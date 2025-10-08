import { useIntersection } from "@mantine/hooks";
import { useEffect } from "react";

interface UseInfiniteLoadingProps {
  onIntersect: () => void;
}

export const useInfiniteLoading = ({
  onIntersect,
}: UseInfiniteLoadingProps) => {
  const { ref, entry } = useIntersection({
    threshold: 0.25,
  });

  useEffect(() => {
    if (entry?.isIntersecting) onIntersect();
  }, [entry?.isIntersecting, onIntersect]);

  return {
    ref,
  };
};

export const useListGroupedByYearMonth = <
  T extends { id: string; createdAt: string },
>(
  list: T[] = [],
) => {
  const firstItemOfYearMonth = list?.reduce(
    (result: Record<string, string>, item) => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!result[key]) {
        result[key] = item.id;
      }

      return result;
    },
    {},
  );

  const isFirstOfYearMonth = (date: Date, itemId: string) => {
    return (
      firstItemOfYearMonth[`${date.getFullYear()}-${date.getMonth()}`] ===
      itemId
    );
  };

  return { isFirstOfYearMonth };
};
