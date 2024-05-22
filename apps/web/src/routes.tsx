import { createBrowserRouter, redirect } from "react-router-dom";
import {
  isAuthError,
  redirectIfCredentials,
  redirectIfNoCredentials,
} from "./providers/auth.provider";
import { PageNotFound } from "./app/404";
import { ErrorPage } from "./app/500";
import { GithubInstallPage } from "./app/github/install/page";
import {
  installGitAppIfNoWorkspaces,
  skipOAuthIfAuthenticated,
} from "./providers/github.provider";
import { LoginPage } from "./app/auth/login/page";
import { OAuthGithubPage } from "./app/github/oauth/page";
import { HomePage } from "./app/home/page";
import { AppPage } from "./app/page";
import { RepositoriesPage } from "./app/repositories/page";
import { SettingsPage } from "./app/settings/page";
import { TeamsPage } from "./app/teams/page";
import { TeamPage } from "./app/teams/[id]/page";
import { TeamMembersPage } from "./app/teams/[id]/members/page";
import { TeamPullRequestsPage } from "./app/teams/[id]/pull-requests/page";
import { PeoplePage } from "./app/people/page";
import { PersonPage } from "./app/people/[handle]/page";
import { PersonOverviewPage } from "./app/people/[handle]/overview/page";
import { PersonCodeReviewsPage } from "./app/people/[handle]/code-reviews/page";
import { PersonPullRequestsPage } from "./app/people/[handle]/pull-requests/page";
import { AutomationsPage } from "./app/automations/page";
import { AutomationPage } from "./app/automations/[id]/page";
import { TeamHealthAndPerformancePage } from "./app/teams/[id]/health-and-performance/page";
import { TeamHealthCodeReviewDistributionPage } from "./app/teams/[id]/health-and-performance/health/code-review-distribution/page";
import { TeamPullRequestsCycleTimePage } from "./app/teams/[id]/health-and-performance/pull-requests/cycle-time/page";
import { TeamPullRequestsSizeDistribution } from "./app/teams/[id]/health-and-performance/pull-requests/size-distribution/page";
import { TeamPullRequestsTimeToMergePage } from "./app/teams/[id]/health-and-performance/pull-requests/time-to-merge/page";
import { TeamCodeReviewsTimeToApprovePage } from "./app/teams/[id]/health-and-performance/code-reviews/time-to-approve/page";
import { TeamCodeReviewsTimeToFirstReviewPage } from "./app/teams/[id]/health-and-performance/code-reviews/time-to-first-review/page";
import { loadUserWithWorkspaces } from "./providers/workspace.provider";
import { showInfoNotification } from "./providers/notification.provider";

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
            path: "automations/:slug",
            element: <AutomationPage />,
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
