import { useEffect } from "react";
import {
  ECOption,
  echarts,
} from "../../../../../../providers/echarts.provider";
import {
  CodeReviewDistributionChartData,
  Period,
} from "@sweetr/graphql-types/frontend/graphql";
import { getAbbreviatedName } from "../../../../../../providers/person.provider";

interface ChartAverageTimeProps {
  chartData?: CodeReviewDistributionChartData | null;
  period: Period;
}

export const ChartCodeReviewDistribution = ({
  chartData,
  period,
}: ChartAverageTimeProps) => {
  useEffect(() => {
    if (!chartData) return;

    const chart = echarts.init(document.getElementById("main"), "dark");
    const numberOfReviewers = chartData.entities.filter((entity) =>
      entity.id.includes("cr-author"),
    ).length;
    const idealLoad = chartData.totalReviews / numberOfReviewers;

    // Calculates symbol size based on review load (%)
    const calculateSymbolSize = (numberOfReviews?: number | null) => {
      if (!numberOfReviews) return 62.5;

      const baseSize = 62.5;
      const minSize = 25;
      const maxSize = 150;
      const scalingFactor = (maxSize - baseSize) / idealLoad;
      const deviation = numberOfReviews - idealLoad;
      const size = baseSize + deviation * scalingFactor;

      return Math.max(minSize, Math.min(size, maxSize));
    };

    const options: ECOption = {
      backgroundColor: "#25262B",
      legend: [
        {
          data: chartData.entities
            .filter((entity) => entity.id.includes("cr-author"))
            .map((entity) => entity.name as string),
          top: "0%",
        },
      ],
      // @ts-expect-error ECharts types
      tooltip: {
        backgroundColor: "#25262B",
        borderColor: "#303030",
        padding: [0, 0],
        textStyle: {
          color: "#fff",
          fontSize: 16,
        },
        enterable: true,
        position: function (point, params, dom, rect, size) {
          if (!rect) return [0, 0];

          const availableSpaceRight =
            size.viewSize[0] - (rect.width + size.contentSize[0] + rect.x);

          if (availableSpaceRight > 0) {
            return [rect?.x + rect?.width, rect?.y];
          }

          return [rect?.x - size.contentSize[0], rect?.y];
        },
        confine: true,
        formatter: (params: {
          dataType?: string;
          data: { value: number; id: string };
        }) => {
          if (params.dataType === "edge") return "";

          const reviewCount = params.data.value;

          const targets = chartData.links
            .filter((link) => link.source === params.data.id)
            .flatMap((link) => {
              const target = chartData.entities.find(
                (entity) => entity.id === link.target,
              );

              if (!target) return [];

              return [
                {
                  id: target.id,
                  name: target.name,
                  image: target.image,
                  reviewCount: link.value,
                },
              ];
            });

          const getTargetHtml = (target: (typeof targets)[number]) => {
            return `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center;">
              <img src="${
                target.image
              }" width="24" height="24" style="border-radius: 50%; margin-right: 10px;"/> 
              ${getAbbreviatedName(target.name)}
              </div>
              <div style="padding-left: 15px;">${target.reviewCount}</div>
            </div>
            `;
          };

          const teamTargets = targets
            .filter((target) => target.id?.split(":").at(-1) === "internal")
            .sort((a, b) => b.reviewCount - a.reviewCount);

          const externalTargets = targets
            .filter((target) => target.id?.split(":").at(-1) === "external")
            .sort((a, b) => b.reviewCount - a.reviewCount);

          const totalTeamReviews = teamTargets.reduce(
            (accumulator, target) => accumulator + target.reviewCount,
            0,
          );
          const totalExternalReviews = externalTargets.reduce(
            (accumulator, target) => accumulator + target.reviewCount,
            0,
          );

          if (!reviewCount) return "";

          return `
            <div style="max-height: 300px; overflow-y: auto;">
              <div style="padding: 0 15px 0px 15px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                  <div>Team: ${totalTeamReviews}</div>
                  <div style="color: #909090">${(
                    (totalTeamReviews * 100) /
                    reviewCount
                  ).toFixed(1)}%</div>
                </div>
                ${teamTargets.map(getTargetHtml).join("")}
              </div>
              
              <div style="padding: 0 15px 0px 15px; border-top: 1px solid #373A40;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                  <div>External: ${totalExternalReviews}</div> 
                
                  <div style="color: #909090; padding-left:10px;">${(
                    (totalExternalReviews * 100) /
                    reviewCount
                  ).toFixed(1)}%</div>
                </div>
                ${externalTargets.map(getTargetHtml).join("")}
              </div>
            </div>
            
            <div style="font-weight: bold; padding: 10px 0 10px 15px; border-top: 1px solid #373A40;">Total: ${reviewCount}</div> `;
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          tooltip: {},
          roam: true,
          zoom: 0.6,
          label: {
            position: "bottom",
            color: "rgba(255, 255, 255, 0.9)",
            textBorderWidth: 3,
            textBorderColor: "rgba(0, 0, 0, 0.9)",
          },
          symbolOffset: 5,
          lineStyle: {
            curveness: 0.1,
            color: "#fff",
            width: 1,
            type: "dashed",
          },
          force: {
            initLayout: "circular",
            repulsion: 3500,
            gravity: 0.8,
            edgeLength: 100,
          },
          scaleLimit: {
            min: 0.4,
            max: 1.2,
          },
          categories: chartData.entities.map((entity) => ({
            name: entity.name,
            value: entity.id,
            itemStyle: {
              color: "#8ce99a",
            },
          })),
          data: [
            ...chartData.entities.map((entity) => {
              const isReviewer = entity.id.includes("cr-author");

              return {
                id: entity.id,
                value: entity.reviewCount,
                name: entity.name,
                symbol: entity.image ? `image://${entity.image}` : "square",
                symbolSize: isReviewer
                  ? calculateSymbolSize(entity.reviewCount)
                  : 25,
                category: entity.id.includes("cr-author")
                  ? entity.name
                  : entity.id.split(":").at(1),
                label: {
                  show: isReviewer || undefined,
                  distance: 5,
                },
                itemStyle: {
                  color: "white",
                },
              };
            }),
          ],
          links: [
            ...chartData.links.map((link) => ({
              source: link.source,
              target: link.target,
              value: link.value,
            })),
          ],
        },
      ],
    };

    chart.setOption(options);
    chart.renderToCanvas();
  }, [chartData, period]);

  return <div id="main" style={{ width: "100%", height: "100%" }}></div>;
};
