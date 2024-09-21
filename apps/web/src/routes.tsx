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
import { AppPage } from "./app/page";
import { PersonCodeReviewsPage } from "./app/people/[handle]/code-reviews/page";
import { PersonOverviewPage } from "./app/people/[handle]/overview/page";
import { PersonPage } from "./app/people/[handle]/page";
import { PersonPullRequestsPage } from "./app/people/[handle]/pull-requests/page";
import { PeoplePage } from "./app/people/page";
import { RepositoriesPage } from "./app/repositories/page";
import { BillingPage } from "./app/settings/billing/page";
import { IntegrationsPage } from "./app/settings/integrations/page";
import { IntegrationSlackPage } from "./app/settings/integrations/slack/page";
import { MyAccountPage } from "./app/settings/my-account/page";
import { SettingsPage } from "./app/settings/page";
import { WorkspaceSettingsPage } from "./app/settings/workspace/page";
import { TeamDigestsPage } from "./app/teams/[id]/digests/page";
import { TeamCodeReviewsTimeToApprovePage } from "./app/teams/[id]/health-and-performance/code-reviews/time-to-approve/page";
import { TeamCodeReviewsTimeToFirstReviewPage } from "./app/teams/[id]/health-and-performance/code-reviews/time-to-first-review/page";
import { TeamHealthCodeReviewDistributionPage } from "./app/teams/[id]/health-and-performance/health/code-review-distribution/page";
import { TeamHealthAndPerformancePage } from "./app/teams/[id]/health-and-performance/page";
import { TeamPullRequestsCycleTimePage } from "./app/teams/[id]/health-and-performance/pull-requests/cycle-time/page";
import { TeamPullRequestsSizeDistribution } from "./app/teams/[id]/health-and-performance/pull-requests/size-distribution/page";
import { TeamPullRequestsTimeToMergePage } from "./app/teams/[id]/health-and-performance/pull-requests/time-to-merge/page";
import { TeamMembersPage } from "./app/teams/[id]/members/page";
import { TeamPage } from "./app/teams/[id]/page";
import { TeamPullRequestsPage } from "./app/teams/[id]/pull-requests/page";
import { TeamsPage } from "./app/teams/page";
import {
  isAuthError,
  redirectIfCredentials,
  redirectIfNoCredentials,
} from "./providers/auth.provider";
import {
  installGitAppIfNoWorkspaces,
  skipOAuthIfAuthenticated,
} from "./providers/github.provider";
import { showInfoNotification } from "./providers/notification.provider";
import { loadUserWithWorkspaces } from "./providers/workspace.provider";

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
                loader: skipOAuthIfAuthenticated,
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
        loader: async () => {
          const redirectResponse = redirectIfNoCredentials();

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
            path: "/repositories",
            element: <RepositoriesPage />,
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
                path: "/settings/my-account",
                element: <MyAccountPage />,
              },
              {
                path: "/settings/integrations",
                element: <IntegrationsPage />,
              },
              {
                path: "/settings/integrations/slack",
                element: <IntegrationSlackPage />,
              },
            ],
          },
          {
            path: "/teams",
            element: <TeamsPage />,
          },
          {
            path: "/teams/:teamId",
            element: <TeamPage />,
            children: [
              {
                path: "/teams/:teamId",
                element: <TeamMembersPage />,
              },
              {
                path: "/teams/:teamId/pull-requests",
                element: <TeamPullRequestsPage />,
              },
              {
                path: "/teams/:teamId/digests",
                element: <TeamDigestsPage />,
              },
              {
                path: "/teams/:teamId/health-and-performance",
                element: <TeamHealthAndPerformancePage />,
                children: [
                  {
                    path: "/teams/:teamId/health-and-performance/health/code-review-distribution",
                    element: <TeamHealthCodeReviewDistributionPage />,
                  },
                  {
                    path: "/teams/:teamId/health-and-performance/pull-requests/cycle-time",
                    element: <TeamPullRequestsCycleTimePage />,
                  },
                  {
                    path: "/teams/:teamId/health-and-performance/pull-requests/size-distribution",
                    element: <TeamPullRequestsSizeDistribution />,
                  },
                  {
                    path: "/teams/:teamId/health-and-performance/pull-requests/time-to-merge",
                    element: <TeamPullRequestsTimeToMergePage />,
                  },
                  {
                    path: "/teams/:teamId/health-and-performance/code-reviews/time-to-approve",
                    element: <TeamCodeReviewsTimeToApprovePage />,
                  },
                  {
                    path: "/teams/:teamId/health-and-performance/code-reviews/time-to-first-review",
                    element: <TeamCodeReviewsTimeToFirstReviewPage />,
                  },
                ],
              },
            ],
          },
          {
            path: "/people",
            element: <PeoplePage />,
          },
          {
            path: "/people/:handle",
            element: <PersonPage />,
            children: [
              {
                path: "/people/:handle",
                element: <PersonOverviewPage />,
              },
              {
                path: "/people/:handle/pull-requests",
                element: <PersonPullRequestsPage />,
              },
              {
                path: "/people/:handle/code-reviews",
                element: <PersonCodeReviewsPage />,
              },
            ],
          },
          {
            path: "automations",
            element: <AutomationsPage />,
          },
          {
            path: "automations/pr-title-check",
            element: <AutomationPrTitleCheckPage />,
          },
          {
            path: "automations/pr-size-labeler",
            element: <AutomationPrSizeLabelerPage />,
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
