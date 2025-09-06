import { Skeleton, Stack } from "@mantine/core";

export const DigestLoadingSkeleton = () => {
  return (
    <Stack p="md">
      <Skeleton h={50} />
      <Skeleton h={175} mt={24} />
      <Skeleton h={232} mt="lg" />
      <Skeleton h={36} mt="lg" />
    </Stack>
  );
};
