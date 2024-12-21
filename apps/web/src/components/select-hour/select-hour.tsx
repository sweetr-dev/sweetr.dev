import { Select, SelectProps } from "@mantine/core";

const hours = [
  { label: "12:00 AM", value: "00:00" },
  { label: "01:00 AM", value: "01:00" },
  { label: "02:00 AM", value: "02:00" },
  { label: "03:00 AM", value: "03:00" },
  { label: "04:00 AM", value: "04:00" },
  { label: "05:00 AM", value: "05:00" },
  { label: "06:00 AM", value: "06:00" },
  { label: "07:00 AM", value: "07:00" },
  { label: "08:00 AM", value: "08:00" },
  { label: "09:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "01:00 PM", value: "13:00" },
  { label: "02:00 PM", value: "14:00" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:00 PM", value: "16:00" },
  { label: "05:00 PM", value: "17:00" },
  { label: "06:00 PM", value: "18:00" },
  { label: "07:00 PM", value: "19:00" },
  { label: "08:00 PM", value: "20:00" },
  { label: "09:00 PM", value: "21:00" },
  { label: "10:00 PM", value: "22:00" },
  { label: "11:00 PM", value: "23:00" },
];

export const SelectHour = (props: SelectProps) => {
  return <Select data={hours} searchable {...props} />;
};
