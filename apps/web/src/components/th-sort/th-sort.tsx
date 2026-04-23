import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";

interface ThSortProps {
  active: boolean;
  direction: "asc" | "desc";
}

export const ThSort = ({ active, direction }: ThSortProps) => {
  if (!active) return <IconSelector size={14} stroke={1.5} color="#868e96" />;
  return direction === "asc" ? (
    <IconChevronUp size={14} stroke={1.5} />
  ) : (
    <IconChevronDown size={14} stroke={1.5} />
  );
};
