import { Group, Loader, LoaderProps } from "@mantine/core";
import { ForwardedRef, forwardRef } from "react";

export const LoaderInfiniteScroll = forwardRef(
  (props: LoaderProps, ref: ForwardedRef<HTMLSpanElement>) => {
    return (
      <Group align="center" justify="center">
        <Loader type="dots" size="lg" ref={ref} {...props} />
      </Group>
    );
  },
);

LoaderInfiniteScroll.displayName = "LoaderInfiniteScroll";
