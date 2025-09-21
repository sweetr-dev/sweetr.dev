import { UseFormReturnType } from "@mantine/form";
import { useEffect } from "react";

interface UseFormAsyncDataProps<T> {
  form: UseFormReturnType<T>;
  isFetched: boolean;
  values: T;
}

export const useFormAsyncData = <T>({
  isFetched,
  values,
  form,
}: UseFormAsyncDataProps<T>) => {
  useEffect(() => {
    if (!isFetched) return;

    form.setValues(values);
    form.resetDirty();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);
};
