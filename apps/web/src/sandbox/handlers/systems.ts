import { graphql, HttpResponse } from "msw";
import {
  AlertType,
  AutomationType,
  DeploymentSettingsTrigger,
  DigestType,
  IntegrationApp,
} from "@sweetr/graphql-types/frontend/graphql";

export const systemsHandlers = [
  graphql.query("Repositories", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          repositories: [
            {
              __typename: "Repository",
              id: "1",
              name: "sweetr.dev",
              fullName: "sweetr-dev/sweetr.dev",
            },
            {
              __typename: "Repository",
              id: "2",
              name: "docs",
              fullName: "sweetr-dev/docs",
            },
          ],
        },
      },
    });
  }),

  graphql.query("Applications", ({ variables }) => {
    const input = (variables.input ?? {}) as { cursor?: string };
    if (input.cursor) {
      return HttpResponse.json({
        data: {
          workspace: { __typename: "Workspace", applications: [] },
        },
      });
    }

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          applications: [
            {
              __typename: "Application",
              id: "1",
              name: "sweetr-api",
              description: "Backend API service",
              archivedAt: null,
              team: {
                __typename: "Team",
                id: "1",
                name: "Platform",
                icon: "🛠️",
                startColor: "#6741d9",
                endColor: "#9775fa",
              },
              repository: {
                __typename: "Repository",
                id: "1",
                fullName: "sweetr-dev/sweetr.dev",
              },
              lastProductionDeployment: null,
            },
            {
              __typename: "Application",
              id: "2",
              name: "sweetr-web",
              description: "Frontend web application",
              archivedAt: null,
              team: {
                __typename: "Team",
                id: "2",
                name: "Frontend",
                icon: "🎨",
                startColor: "#1c7ed6",
                endColor: "#74c0fc",
              },
              repository: {
                __typename: "Repository",
                id: "1",
                fullName: "sweetr-dev/sweetr.dev",
              },
              lastProductionDeployment: null,
            },
          ],
        },
      },
    });
  }),

  graphql.query("Environments", ({ variables }) => {
    const input = (variables.input ?? {}) as { cursor?: string };
    if (input.cursor) {
      return HttpResponse.json({
        data: {
          workspace: { __typename: "Workspace", environments: [] },
        },
      });
    }

    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          environments: [
            {
              __typename: "Environment",
              id: "1",
              name: "production",
              isProduction: true,
              archivedAt: null,
            },
            {
              __typename: "Environment",
              id: "2",
              name: "staging",
              isProduction: false,
              archivedAt: null,
            },
          ],
        },
      },
    });
  }),

  graphql.query("EnvironmentOptions", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          environments: [
            {
              __typename: "Environment",
              id: "1",
              name: "production",
            },
            {
              __typename: "Environment",
              id: "2",
              name: "staging",
            },
          ],
        },
      },
    });
  }),

  graphql.query("Incidents", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          incidents: [],
        },
      },
    });
  }),

  graphql.query("Deployments", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          deployments: [],
        },
      },
    });
  }),

  graphql.query("DeploymentOptions", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          applications: [
            {
              __typename: "Application",
              id: "1",
              name: "sweetr-api",
            },
            {
              __typename: "Application",
              id: "2",
              name: "sweetr-web",
            },
          ],
        },
      },
    });
  }),

  graphql.query("WorkspaceAutomations", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          automations: [
            {
              __typename: "Automation",
              type: AutomationType.PR_SIZE_LABELER,
              enabled: true,
            },
            {
              __typename: "Automation",
              type: AutomationType.PR_TITLE_CHECK,
              enabled: true,
            },
            {
              __typename: "Automation",
              type: AutomationType.INCIDENT_DETECTION,
              enabled: false,
            },
          ],
        },
      },
    });
  }),

  graphql.query("WorkspaceAutomation", ({ variables }) => {
    const type = variables.input?.type as AutomationType;
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          automation: {
            __typename: "Automation",
            type,
            enabled: type !== AutomationType.INCIDENT_DETECTION,
            settings: null,
          },
        },
      },
    });
  }),

  graphql.query("ApplicationOptions", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          applications: [
            {
              __typename: "Application",
              id: "1",
              name: "sweetr-api",
              description: "Backend API service",
              team: {
                __typename: "Team",
                id: "1",
                name: "Platform",
                icon: "🛠️",
              },
            },
            {
              __typename: "Application",
              id: "2",
              name: "sweetr-web",
              description: "Frontend web application",
              team: {
                __typename: "Team",
                id: "2",
                name: "Frontend",
                icon: "🎨",
              },
            },
          ],
        },
      },
    });
  }),

  graphql.query("Application", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          application: {
            __typename: "Application",
            id: "1",
            name: "sweetr-api",
            description: "Backend API service",
            archivedAt: null,
            team: { __typename: "Team", id: "1", name: "Platform", icon: "🛠️" },
            repository: {
              __typename: "Repository",
              id: "1",
              name: "sweetr.dev",
            },
            deploymentSettings: {
              __typename: "DeploymentSettings",
              trigger: DeploymentSettingsTrigger.MERGE,
              subdirectory: null,
              targetBranch: "main",
            },
          },
        },
      },
    });
  }),

  graphql.query("Incident", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          incident: null,
        },
      },
    });
  }),

  graphql.query("Deployment", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          deployment: null,
        },
      },
    });
  }),

  graphql.query("TeamAlerts", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          team: {
            __typename: "Team",
            alerts: [
              {
                __typename: "Alert",
                type: AlertType.SLOW_REVIEW,
                enabled: false,
              },
              {
                __typename: "Alert",
                type: AlertType.SLOW_MERGE,
                enabled: false,
              },
              {
                __typename: "Alert",
                type: AlertType.MERGED_WITHOUT_APPROVAL,
                enabled: false,
              },
            ],
          },
        },
      },
    });
  }),

  graphql.query("TeamAlert", ({ variables }) => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          team: {
            __typename: "Team",
            alert: {
              __typename: "Alert",
              type: variables.input?.type ?? AlertType.SLOW_REVIEW,
              enabled: false,
              channel: "",
              settings: {},
            },
          },
        },
      },
    });
  }),

  graphql.query("TeamDigests", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          team: {
            __typename: "Team",
            digests: [
              {
                __typename: "Digest",
                type: DigestType.TEAM_WIP,
                enabled: true,
              },
              {
                __typename: "Digest",
                type: DigestType.TEAM_METRICS,
                enabled: true,
              },
            ],
          },
        },
      },
    });
  }),

  graphql.query("TeamDigest", ({ variables }) => {
    const type = variables.input?.type ?? DigestType.TEAM_WIP;
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          team: {
            __typename: "Team",
            digest: {
              __typename: "Digest",
              type,
              enabled: true,
              channel: "engineering",
              frequency: "WEEKLY",
              dayOfTheWeek: ["MONDAY"],
              timeOfDay: "09:00",
              timezone: "America/New_York",
              settings: {},
            },
          },
        },
      },
    });
  }),

  graphql.query("Billing", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          billing: {
            __typename: "Billing",
            estimatedSeats: 5,
            purchasablePlans: null,
          },
        },
      },
    });
  }),

  graphql.query("WorkspaceIntegrations", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          integrations: [
            {
              __typename: "Integration",
              app: IntegrationApp.SLACK,
              isEnabled: true,
              installUrl: null,
              enabledAt: new Date().toISOString(),
              target: "#engineering",
            },
          ],
        },
      },
    });
  }),

  graphql.query("WorkspaceSettings", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          id: "1",
          settings: {
            __typename: "WorkspaceSettings",
            pullRequest: {
              __typename: "WorkspaceSettingsPullRequest",
              size: {
                __typename: "WorkspaceSettingsPullRequestSize",
                tiny: 10,
                small: 50,
                medium: 200,
                large: 500,
                ignorePatterns: [],
              },
            },
          },
        },
      },
    });
  }),

  graphql.query("WorkspaceApiKey", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          apiKey: null,
        },
      },
    });
  }),

  graphql.query("WorkspaceLastSyncBatch", () => {
    return HttpResponse.json({
      data: {
        workspace: {
          __typename: "Workspace",
          lastSyncBatch: null,
        },
      },
    });
  }),
];
