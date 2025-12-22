export interface DateTimeRange {
  from?: string;
  to?: string;
}
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
