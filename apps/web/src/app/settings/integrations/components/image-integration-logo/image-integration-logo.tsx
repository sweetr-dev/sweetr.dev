import React from "react";
import { Image } from "@mantine/core";

interface ImageIntegrationLogoProps {
  brand: "slack" | "msteams";
}

export const ImageIntegrationLogo = ({ brand }: ImageIntegrationLogoProps) => {
  return <Image src={`/images/logos/${brand}.svg`} h={100} />;
};
