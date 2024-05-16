import { Box, BoxProps } from "@mantine/core";

interface LoadableContentProps extends BoxProps {
  isLoading: boolean;
  whenLoading: React.ReactNode;
  content: React.ReactNode;
  isEmpty?: boolean;
  whenEmpty?: React.ReactNode;
}

export const LoadableContent = ({
  isLoading,
  isEmpty,
  whenEmpty,
  whenLoading,
  content,
  ...boxProps
}: LoadableContentProps) => {
  return (
    <Box {...boxProps}>
      {isLoading && whenLoading}
      {isEmpty && whenEmpty}
      {!isLoading && !isEmpty && content}
    </Box>
  );
};
