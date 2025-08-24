import { Image, ImageProps } from "@mantine/core";

interface ImageIntegrationLogoProps extends ImageProps {
  brand: "slack" | "msteams";
}

export const ImageIntegrationLogo = ({
  brand,
  ...props
}: ImageIntegrationLogoProps) => {
  return (
    <Image src={`/images/logos/${brand}.svg`} h={100} w="auto" {...props} />
  );
};
