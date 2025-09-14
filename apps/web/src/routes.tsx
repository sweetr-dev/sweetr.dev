import { createBrowserRouter, redirect } from "react-router-dom";
import { PageNotFound } from "./app/404";
import { ErrorPage } from "./app/500";
import { LoginPage } from "./app/auth/login/page";
import { AutomationsPage } from "./app/automations/page";
import { AutomationPrSizeLabelerPage } from "./app/automations/settings/pr-size-labeler/page";
import { AutomationPrTitleCheckPage } from "./app/automations/settings/pr-title-check/page";
import { GithubInstallPage } from "./app/github/install/page";
import { OAuthGithubPage } from "./app/github/oauth/page";
import { HomePage } from "./app/home/page";
import { HumansPage } from "./app/humans/page";
import { PersonCodeReviewsPage } from "./app/humans/people/[handle]/code-reviews/page";
import { PersonOverviewPage } from "./app/humans/people/[handle]/overview/page";
import { PersonPage } from "./app/humans/people/[handle]/page";
import { PersonPullRequestsPage } from "./app/humans/people/[handle]/pull-requests/page";
import { PeoplePage } from "./app/humans/people/page";
import { TeamAlertsPage } from "./app/humans/teams/[id]/alerts/page";
import { MergedWithoutApprovalAlertPage } from "./app/humans/teams/[id]/alerts/settings/merged-without-approval/page";
import { SlowMergeAlertPage } from "./app/humans/teams/[id]/alerts/settings/slow-merge/page";
import { SlowReviewAlertPage } from "./app/humans/teams/[id]/alerts/settings/slow-review/page";
import { TeamDigestsPage } from "./app/humans/teams/[id]/digests/page";
import { TeamMetricsDigestPage } from "./app/humans/teams/[id]/digests/settings/team-metrics/page";
import { TeamWipDigestPage } from "./app/humans/teams/[id]/digests/settings/team-wip/page";
import { TeamCodeReviewDistributionPage } from "./app/humans/teams/[id]/health-and-performance/activity/code-review-distribution/page";
import { TeamCodeReviewsTimeToApprovePage } from "./app/humans/teams/[id]/health-and-performance/code-reviews/time-to-approve/page";
import { TeamCodeReviewsTimeToFirstReviewPage } from "./app/humans/teams/[id]/health-and-performance/code-reviews/time-to-first-review/page";
import { TeamHealthAndPerformancePage } from "./app/humans/teams/[id]/health-and-performance/page";
import { TeamPullRequestsCycleTimePage } from "./app/humans/teams/[id]/health-and-performance/pull-requests/cycle-time/page";
import { TeamPullRequestsSizeDistribution } from "./app/humans/teams/[id]/health-and-performance/pull-requests/size-distribution/page";
import { TeamPullRequestsTimeToMergePage } from "./app/humans/teams/[id]/health-and-performance/pull-requests/time-to-merge/page";
import { TeamMembersPage } from "./app/humans/teams/[id]/members/page";
import { TeamPage } from "./app/humans/teams/[id]/page";
import { TeamPullRequestsPage } from "./app/humans/teams/[id]/pull-requests/page";
import { TeamWorkInProgressPage } from "./app/humans/teams/[id]/work-in-progress/page";
import { TeamWorkLogPage } from "./app/humans/teams/[id]/work-log/page";
import { TeamsPage } from "./app/humans/teams/page";
import { MetricsAndInsightsPage } from "./app/metrics-and-insights/page";
import { AppPage } from "./app/page";
import { BillingPage } from "./app/settings/billing/page";
import { IntegrationsPage } from "./app/settings/integrations/page";
import { IntegrationSlackPage } from "./app/settings/integrations/slack/page";
import { MyAccountPage } from "./app/settings/my-account/page";
import { SettingsPage } from "./app/settings/page";
import { PullRequestSettingsPage } from "./app/settings/pull-request-settings/page";
import { PullRequestSizePage } from "./app/settings/pull-request-settings/size/page";
import { WorkspaceSettingsPage } from "./app/settings/workspace/page";
import { SystemsPage } from "./app/systems/page";
import { RepositoriesPage } from "./app/systems/repositories/page";
import {
  isAuthError,
  redirectIfCredentials,
  redirectIfNoCredentials,
} from "./providers/auth.provider";
import {
  handleOAuthRedirect,
  installGitAppIfNoWorkspaces,
} from "./providers/github.provider";
import { showInfoNotification } from "./providers/notification.provider";
import { loadUserWithWorkspaces } from "./providers/workspace.provider";
import { DeploymentsPage } from "./app/systems/deployments/page";
import { ApplicationsPage } from "./app/systems/applications/page";
import { IncidentsPage } from "./app/systems/incidents/page";

export const router = createBrowserRouter([
  {
    children: [
      {
        // Always accessible pages
        children: [
          {
            path: "/github",
            children: [
              {
                loader: handleOAuthRedirect,
                path: "/github/callback",
                element: <OAuthGithubPage />,
              },
              {
                path: "/github/install",
                element: <GithubInstallPage />,
              },
            ],
          },
        ],
      },
      // Public-only pages
      {
        loader: redirectIfCredentials,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },
      // Authenticated pages
      {
        element: <AppPage />,
        errorElement: (
          <AppPage>
            <ErrorPage />
          </AppPage>
        ),
        loader: async ({ request }) => {
          const redirectResponse = redirectIfNoCredentials(
            new URL(request.url),
          );

          if (redirectResponse) {
            showInfoNotification({
              title: "Session expired",
              message: "Please authenticate your credentials again.",
            });

            return redirectResponse;
          }

          try {
            await loadUserWithWorkspaces();
          } catch (error) {
            if (isAuthError(error)) {
              return redirect("/login");
            }

            throw error;
          }

          return installGitAppIfNoWorkspaces();
        },
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/systems/",
            element: <SystemsPage />,
            children: [
              {
                path: "/systems/repositories",
                element: <RepositoriesPage />,
              },
              {
                path: "/systems/applications",
                element: <ApplicationsPage />,
              },
              {
                path: "/systems/deployments",
                element: <DeploymentsPage />,
              },
              {
                path: "/systems/incidents",
                element: <IncidentsPage />,
              },
            ],
          },
          {
            path: "/settings",
            element: <SettingsPage />,
            children: [
              {
                path: "/settings/workspace",
                element: <WorkspaceSettingsPage />,
              },
              {
                path: "/settings/billing",
                element: <BillingPage />,
              },
              {
                path: "/settings/pull-request",
                element: <PullRequestSettingsPage />,
                children: [
                  {
                    path: "/settings/pull-request/size",
                    element: <PullRequestSizePage />,
                  },
                ],
              },
              {
                path: "/settings/my-account",
                element: <MyAccountPage />,
              },
              {
                path: "/settings/integrations",
                element: <IntegrationsPage />,
                children: [
                  {
                    path: "/settings/integrations/slack",
                    element: <IntegrationSlackPage />,
                  },
                ],
              },
            ],
          },
          {
            path: "metrics-and-insights",
            element: <MetricsAndInsightsPage />,
          },
          {
            path: "/humans",
            element: <HumansPage />,
            children: [
              {
                path: "/humans/teams",
                element: <TeamsPage />,
              },
              {
                path: "/humans/teams/:teamId",
                element: <TeamPage />,
                children: [
                  {
                    path: "/humans/teams/:teamId",
                    element: <TeamWorkInProgressPage />,
                  },
                  {
                    path: "/humans/teams/:teamId/work-log",
                    element: <TeamWorkLogPage />,
                  },
                  {
                    path: "/humans/teams/:teamId/members",
                    element: <TeamMembersPage />,
                  },
                  {
                    path: "/humans/teams/:teamId/pull-requests",
                    element: <TeamPullRequestsPage />,
                  },
                  {
                    path: "/humans/teams/:teamId/alerts",
                    element: <TeamAlertsPage />,
                    children: [
                      {
                        path: "/humans/teams/:teamId/alerts/slow-merge",
                        element: <SlowMergeAlertPage />,
                      },
                      {
                        path: "/humans/teams/:teamId/alerts/slow-review",
                        element: <SlowReviewAlertPage />,
                      },
                      {
                        path: "/humans/teams/:teamId/alerts/merged-without-approval",
                        element: <MergedWithoutApprovalAlertPage />,
                      },
                    ],
                  },
                  {
                    path: "/humans/teams/:teamId/digests",
                    element: <TeamDigestsPage />,
                    children: [
                      {
                        path: "/humans/teams/:teamId/digests/metrics",
                        element: <TeamMetricsDigestPage />,
                      },
                      {
                        path: "/humans/teams/:teamId/digests/wip",
                        element: <TeamWipDigestPage />,
                      },
                    ],
                  },
                  {
                    path: "/humans/teams/:teamId/health-and-performance",
                    element: <TeamHealthAndPerformancePage />,
                    children: [
                      {
                        path: "/humans/teams/:teamId/health-and-performance/activity/code-review-distribution",
                        element: <TeamCodeReviewDistributionPage />,
                      },
                      {
                        path: "/humans/teams/:teamId/health-and-performance/pull-requests/cycle-time",
                        element: <TeamPullRequestsCycleTimePage />,
                      },
                      {
                        path: "/humans/teams/:teamId/health-and-performance/pull-requests/size-distribution",
                        element: <TeamPullRequestsSizeDistribution />,
                      },
                      {
                        path: "/humans/teams/:teamId/health-and-performance/pull-requests/time-to-merge",
                        element: <TeamPullRequestsTimeToMergePage />,
                      },
                      {
                        path: "/humans/teams/:teamId/health-and-performance/code-reviews/time-to-approve",
                        element: <TeamCodeReviewsTimeToApprovePage />,
                      },
                      {
                        path: "/humans/teams/:teamId/health-and-performance/code-reviews/time-to-first-review",
                        element: <TeamCodeReviewsTimeToFirstReviewPage />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "/humans/people",
                element: <PeoplePage />,
              },
              {
                path: "/humans/people/:handle",
                element: <PersonPage />,
                children: [
                  {
                    path: "/humans/people/:handle",
                    element: <PersonOverviewPage />,
                  },
                  {
                    path: "/humans/people/:handle/pull-requests",
                    element: <PersonPullRequestsPage />,
                  },
                  {
                    path: "/humans/people/:handle/code-reviews",
                    element: <PersonCodeReviewsPage />,
                  },
                ],
              },
            ],
          },
          {
            path: "automations",
            element: <AutomationsPage />,
            children: [
              {
                path: "/automations/pr-title-check",
                element: <AutomationPrTitleCheckPage />,
              },
              {
                path: "/automations/pr-size-labeler",
                element: <AutomationPrSizeLabelerPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);
