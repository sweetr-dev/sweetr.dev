import {
  IconHome2,
  IconCircles,
  IconBolt,
  IconStack3,
  IconChartPie,
  IconActivityHeartbeat,
  IconChartBar,
} from "@tabler/icons-react";
import { NavbarItemProps } from "../components/navbar/navbar-item";
import { useEffect } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const navItems: (Omit<NavbarItemProps, "href"> & {
  href: string;
})[] = [
  { icon: IconHome2, label: "Home", href: "/" },
  {
    icon: IconChartPie,
    label: "Metrics & Insights",
    href: "/people",
  },
  {
    icon: IconCircles,
    label: "Teams",
    href: "/teams",
  },
  {
    icon: IconStack3,
    label: "Systems",
    href: "/systems",
  },
  {
    icon: IconBolt,
    label: "Automations",
    href: "/automations",
  },
];

interface NavStore {
  hasSubnav: boolean;
  setHasSubnav: (value: boolean) => void;
}

export const useNavStore = create<NavStore>()(
  devtools((set) => ({
    hasSubnav: false,
    setHasSubnav: (value) => set((state) => ({ ...state, hasSubnav: value })),
  })),
);

export const useSubnav = () => {
  const { setHasSubnav } = useNavStore();

  useEffect(() => {
    setHasSubnav(true);

    return () => {
      setHasSubnav(false);
    };
  }, [setHasSubnav]);
};
