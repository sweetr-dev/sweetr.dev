import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";

interface SortIconProps {
  active: boolean;
  direction: "asc" | "desc";
}

export const SortIcon = ({ active, direction }: SortIconProps) => {
  if (!active)
    return <IconSelector size={14} stroke={1.5} color="#868e96" />;
  return direction === "asc" ? (
    <IconChevronUp size={14} stroke={1.5} />
  ) : (
    <IconChevronDown size={14} stroke={1.5} />
  );
};
