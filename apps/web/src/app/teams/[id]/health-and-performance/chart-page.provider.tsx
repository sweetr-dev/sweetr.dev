import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DrawerScrollableProps } from "../../../../components/drawer-scrollable/drawer-scrollable";

interface UseChartDrawerProps {
  closeUrl: string;
}

export const useChartDrawer = ({ closeUrl }: UseChartDrawerProps) => {
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
    opened: isOpen,
    position: "right",
    trapFocus: false,
    size: "xl",
    onClose: handleClose,
  } as Omit<DrawerScrollableProps, "children">;
};
