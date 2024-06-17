import {
  IconHome2,
  IconCircles,
  IconUsers,
  IconBrandGithub,
  IconBolt,
} from "@tabler/icons-react";
import { NavbarItemProps } from "../components/app-shell/navbar-main/navbar-item";

export const navItems: (Omit<NavbarItemProps, "href"> & {
  href: string;
})[] = [
  { icon: IconHome2, label: "Home", href: "/" },
  {
    icon: IconCircles,
    label: "Teams",
    href: "/teams",
  },
  {
    icon: IconUsers,
    label: "People",
    href: "/people",
  },
  {
    icon: IconBrandGithub,
    label: "Repositories",
    href: "/repositories",
  },
  {
    icon: IconBolt,
    label: "Automations",
    href: "/automations",
  },
];
