export const roundDecimalPoints = (value: number, decimalPoints = 1) =>
  Math.round(value * (10 * decimalPoints)) / (10 * decimalPoints);
