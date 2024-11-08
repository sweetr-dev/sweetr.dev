import { Skeleton } from "@mantine/core";

export const DigestLoadingSkeleton = () => {
  return (
    <>
      <Skeleton h={50} />
      <Skeleton h={175} mt={24} />
      <Skeleton h={232} mt="lg" />
      <Skeleton h={36} mt="lg" />
    </>
  );
};
