import { ActivityEventType } from "@prisma/client";
import { snake } from "radash";

export const getActivityEventId = (
  type: ActivityEventType,
  id: string | number
) => {
  return `${snake(type)}:${id}`;
};
