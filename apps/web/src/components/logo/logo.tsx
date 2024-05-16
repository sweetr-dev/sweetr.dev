import { FC } from "react";
import LogoImg from "../../assets/logo.svg";

interface LogoProps {
  size: number;
}

export const Logo: FC<LogoProps> = ({ size }) => {
  return <img src={LogoImg} alt="sweetr.dev" height={size} width={size} />;
};
