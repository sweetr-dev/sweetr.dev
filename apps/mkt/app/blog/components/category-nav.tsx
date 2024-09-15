"use client";

import {
  IconUsersGroup,
  IconHeartCode,
  IconRocket,
  IconCompass,
  IconChartAreaLine,
  IconBoxMultiple,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export const CategoryNav = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("");

  const searchParams = useSearchParams();

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  return (
    <div className="mt-8 p-1 flex w-fit mx-auto text-dark-100 gap-3 border border-dark-400 rounded-md">
      <CategoryNavItem
        category=""
        active={selectedCategory === ""}
        icon={IconBoxMultiple}
      >
        All
      </CategoryNavItem>
      <CategoryNavItem
        category="leadership"
        active={selectedCategory === "leadership"}
        icon={IconCompass}
      >
        Leadership
      </CategoryNavItem>
      <CategoryNavItem
        category="culture"
        active={selectedCategory === "culture"}
        icon={IconUsersGroup}
      >
        Culture
      </CategoryNavItem>
      <CategoryNavItem
        category="performance"
        active={selectedCategory === "performance"}
        icon={IconRocket}
      >
        Performance
      </CategoryNavItem>
      <CategoryNavItem
        category="developer-experience"
        active={selectedCategory === "developer-experience"}
        icon={IconHeartCode}
      >
        Developer Experience
      </CategoryNavItem>
      <CategoryNavItem
        category="metrics"
        active={selectedCategory === "metrics"}
        icon={IconChartAreaLine}
      >
        Metrics
      </CategoryNavItem>
    </div>
  );
};

interface CategoryNavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active: boolean;
  icon: React.ComponentType<{
    stroke: number;
    size: number;
  }>;
  category: string;
}

const CategoryNavItem = ({
  children,
  icon: Icon,
  active,
  category,
  ...props
}: CategoryNavItemProps) => {
  return (
    <Link href={category ? `?category=${category}` : "/blog"}>
      <div
        {...props}
        className={`font-medium hover:text-green-400 transition-all p-2 rounded-md cursor-pointer ${active ? "bg-green-400/10 text-green-400 " : "hover:scale-105 "}`}
      >
        <div className="flex items-center justify-between gap-2">
          <Icon size={20} stroke={1.5} />
          {children}
        </div>
      </div>
    </Link>
  );
};
