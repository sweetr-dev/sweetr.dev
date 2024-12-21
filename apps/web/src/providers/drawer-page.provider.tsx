import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DrawerScrollableProps } from "../components/drawer-scrollable/drawer-scrollable";

type DrawerProps = Omit<DrawerScrollableProps, "children">;

interface UseDrawerPageProps extends Omit<DrawerProps, "opened" | "onClose"> {
  closeUrl: string;
}

export const useDrawerPage = ({ closeUrl, ...props }: UseDrawerPageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = async () => {
    setIsOpen(false);

    await new Promise((resolve) => setTimeout(resolve, 150)); // Allow closing animation

    navigate(closeUrl);
  };

  return {
    ...props,
    opened: isOpen,
    position: "right",
    trapFocus: false,
    size: "xl",
    onClose: handleClose,
  } as DrawerProps;
};
