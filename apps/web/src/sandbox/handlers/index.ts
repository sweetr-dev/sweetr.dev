import { userWorkspacesHandlers } from "./user-workspaces";
import { homeHandlers } from "./home";
import { pullRequestsHandlers } from "./pull-requests";
import { teamsHandlers } from "./teams";
import { peopleHandlers } from "./people";
import { spotlightHandlers } from "./spotlight";
import { doraMetricsHandlers } from "./dora-metrics";
import { workLogHandlers } from "./work-log";
import { mutationHandlers } from "./mutations";
import { systemsHandlers } from "./systems";
import { prFlowMetricsHandlers } from "./pr-flow-metrics";
import { codeReviewEfficiencyMetricsHandlers } from "./code-review-efficiency-metrics";

export const handlers = [
  ...userWorkspacesHandlers,
  ...homeHandlers,
  ...pullRequestsHandlers,
  ...teamsHandlers,
  ...peopleHandlers,
  ...spotlightHandlers,
  ...doraMetricsHandlers,
  ...workLogHandlers,
  ...systemsHandlers,
  ...prFlowMetricsHandlers,
  ...codeReviewEfficiencyMetricsHandlers,
  ...mutationHandlers,
];
