import * as echarts from "echarts/core";
import { BarChart, LineChart, GraphChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  // Dataset
  DatasetComponent,
  // Built-in transform (filter, sort)
  TransformComponent,
  LegendComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import type {
  // The series option types are defined with the SeriesOption suffix
  BarSeriesOption,
  LineSeriesOption,
  GraphSeriesOption,
} from "echarts/charts";
import type {
  // The component option types are defined with the ComponentOption suffix
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  LegendComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";
import { format } from "date-fns";
import { Period } from "@sweetr/graphql-types/frontend/graphql";

// Create an Option type with only the required components and charts via ComposeOption
export type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | GraphSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
>;

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  BarChart,
  LineChart,
  GraphChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// TO-DO: Upgrade date-fns and use UTCDate
export const formatAxisDate = (date: Date, period: Period): string => {
  if (period === Period.DAILY) return format(date, "MM/dd");
  if (period === Period.WEEKLY) return format(date, "MM/dd");
  if (period === Period.MONTHLY) return format(date, "MMM yy");
  if (period === Period.QUARTERLY) return format(date, "QQQ yy");

  return format(date, "yyyy");
};

// TO-DO: Upgrade date-fns and use UTCDate
export const formatTooltipDate = (date: Date, period: Period): string => {
  if (period === Period.DAILY) return format(date, "MMMM do yyyy");
  if (period === Period.WEEKLY)
    return `Week ${format(date, "I")} - ${format(date, "MMM do yyyy")}`;
  if (period === Period.MONTHLY) return format(date, "MMMM yyyy");
  if (period === Period.QUARTERLY) return format(date, "QQQ yyyy");

  return format(date, "yyyy");
};

export { echarts };
