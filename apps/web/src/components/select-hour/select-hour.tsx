import { Select, SelectProps } from "@mantine/core";

export const SelectHour = (props: SelectProps) => {
  return (
    <Select
      data={Array.from({ length: 24 }, (_, index) => {
        const hour = index % 12 || 0;
        const period = index < 12 ? "AM" : "PM";
        return `${hour.toString().padStart(2, "0")}:00 ${period}`;
      })}
      searchable
      {...props}
    />
  );
};
