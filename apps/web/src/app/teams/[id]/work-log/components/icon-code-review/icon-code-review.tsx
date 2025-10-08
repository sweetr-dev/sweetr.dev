import { IconMessage, IconProps } from "@tabler/icons-react";

export const IconCodeReview = (props: IconProps) => {
  return (
    <IconMessage
      stroke={1.5}
      style={{ color: "white", opacity: 0.8 }}
      {...props}
    />
  );
};
