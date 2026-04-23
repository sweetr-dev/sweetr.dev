export default /* GraphQL */ `
  type NumericChartData {
    columns: [DateTime!]!
    data: [BigInt!]!
  }

  type NumericSeriesChartData {
    columns: [DateTime!]!
    series: [ChartNumericSeries!]!
  }

  type ChartNumericSeries {
    name: String!
    data: [BigInt!]!
    color: HexColorCode
  }

  type ScatterChartData {
    series: [ScatterChartSeries!]!
  }

  type ScatterChartSeries {
    name: String!
    color: HexColorCode
    data: [ScatterPoint!]!
  }

  type ScatterPoint {
    x: Float!
    y: Float!
    title: String
    url: String
  }
`;
