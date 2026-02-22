/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  HexColorCode: { input: string; output: string; }
  JSONObject: { input: object; output: object; }
  SweetID: { input: string; output: string; }
  TimeZone: { input: string; output: string; }
  Void: { input: null; output: null; }
};

export type ActivityEvent = CodeReviewSubmittedEvent | PullRequestCreatedEvent | PullRequestMergedEvent;

export enum ActivityEventType {
  CODE_REVIEW_SUBMITTED = 'CODE_REVIEW_SUBMITTED',
  PULL_REQUEST_CREATED = 'PULL_REQUEST_CREATED',
  PULL_REQUEST_MERGED = 'PULL_REQUEST_MERGED'
}

export type Alert = {
  __typename?: 'Alert';
  channel: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  settings: Scalars['JSONObject']['output'];
  type: AlertType;
};

export type AlertQueryInput = {
  type: AlertType;
};

export enum AlertType {
  HOT_PR = 'HOT_PR',
  MERGED_WITHOUT_APPROVAL = 'MERGED_WITHOUT_APPROVAL',
  SLOW_MERGE = 'SLOW_MERGE',
  SLOW_REVIEW = 'SLOW_REVIEW',
  UNRELEASED_CHANGES = 'UNRELEASED_CHANGES'
}

export type ApiKey = {
  __typename?: 'ApiKey';
  createdAt: Scalars['DateTime']['output'];
  creator: Person;
  id: Scalars['SweetID']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
};

export type Application = {
  __typename?: 'Application';
  /** The time the application was archived */
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The deployment settings for the application */
  deploymentSettings: DeploymentSettings;
  /** The description of the application */
  description?: Maybe<Scalars['String']['output']>;
  /** The id of the application */
  id: Scalars['SweetID']['output'];
  /** The last deployment of the application */
  lastProductionDeployment?: Maybe<Deployment>;
  /** The name of the application */
  name: Scalars['String']['output'];
  /** The repository that the application is in */
  repository: Repository;
  /** The team who owns the application */
  team?: Maybe<Team>;
};

export type ApplicationsQueryInput = {
  /** Whether to only include archived applications. Defaults to false. */
  archivedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The ids to filter by */
  ids?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The amount of records to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The query to search by. Looks up by name. */
  query?: InputMaybe<Scalars['String']['input']>;
  /** The teams to filter by */
  teamIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
};

export type ArchiveApplicationInput = {
  applicationId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type ArchiveDeploymentInput = {
  deploymentId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type ArchiveEnvironmentInput = {
  environmentId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type ArchiveIncidentInput = {
  incidentId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type ArchiveTeamInput = {
  teamId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export enum AuthProvider {
  /** Not supported */
  BITBUCKET = 'BITBUCKET',
  GITHUB = 'GITHUB',
  /** Not supported */
  GITLAB = 'GITLAB'
}

export type AuthProviderInput = {
  provider: AuthProvider;
  redirectTo?: InputMaybe<Scalars['String']['input']>;
};

export type AuthProviderResponse = {
  __typename?: 'AuthProviderResponse';
  redirectUrl: Scalars['String']['output'];
};

export type Automation = {
  __typename?: 'Automation';
  enabled: Scalars['Boolean']['output'];
  settings?: Maybe<Scalars['JSONObject']['output']>;
  type: AutomationType;
};

export type AutomationBenefits = {
  __typename?: 'AutomationBenefits';
  compliance?: Maybe<Scalars['String']['output']>;
  cycleTime?: Maybe<Scalars['String']['output']>;
  failureRate?: Maybe<Scalars['String']['output']>;
  security?: Maybe<Scalars['String']['output']>;
  techDebt?: Maybe<Scalars['String']['output']>;
};

export type AutomationQueryInput = {
  type: AutomationType;
};

export enum AutomationType {
  INCIDENT_DETECTION = 'INCIDENT_DETECTION',
  PR_SIZE_LABELER = 'PR_SIZE_LABELER',
  PR_TITLE_CHECK = 'PR_TITLE_CHECK'
}

export type Billing = {
  __typename?: 'Billing';
  /** The number of contributors the workspace had in the last 30 days */
  estimatedSeats: Scalars['Int']['output'];
  purchasablePlans?: Maybe<PurchasablePlans>;
  subscription?: Maybe<Subscription>;
  trial?: Maybe<Trial>;
};

export type BreakdownStage = {
  __typename?: 'BreakdownStage';
  /** Percentage change from previous period */
  change: Scalars['Float']['output'];
  /** Average time in milliseconds for current period */
  currentAmount: Scalars['BigInt']['output'];
  /** Average time in milliseconds for previous period */
  previousAmount: Scalars['BigInt']['output'];
};

export type ChangeFailureRateMetric = {
  __typename?: 'ChangeFailureRateMetric';
  /** The change in change failure rate */
  change: Scalars['Float']['output'];
  /** The columns for the chart */
  columns: Array<Scalars['DateTime']['output']>;
  /** The change failure rate for the current period */
  currentAmount: Scalars['Float']['output'];
  /** The date range for the current period */
  currentPeriod: DateTimeRangeValue;
  /** The amounts over time for the chart */
  data: Array<Scalars['Float']['output']>;
  /** The change failure rate before the current period */
  previousAmount: Scalars['Float']['output'];
  /** The date range for the previous period */
  previousPeriod: DateTimeRangeValue;
};

export type ChartNumericSeries = {
  __typename?: 'ChartNumericSeries';
  color?: Maybe<Scalars['HexColorCode']['output']>;
  data: Array<Scalars['BigInt']['output']>;
  name: Scalars['String']['output'];
};

export type CodeReview = {
  __typename?: 'CodeReview';
  /** The author */
  author: Person;
  /** The amount of comments */
  commentCount: Scalars['Int']['output'];
  /** The time when the code review was created */
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['SweetID']['output'];
  pullRequest: PullRequest;
  /** The state of the code review */
  state: CodeReviewState;
};

export type CodeReviewDistributionChartData = {
  __typename?: 'CodeReviewDistributionChartData';
  entities: Array<CodeReviewDistributionEntity>;
  links: Array<GraphChartLink>;
  totalReviews: Scalars['Int']['output'];
};

export type CodeReviewDistributionEntity = {
  __typename?: 'CodeReviewDistributionEntity';
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  reviewCount?: Maybe<Scalars['Int']['output']>;
  reviewSharePercentage?: Maybe<Scalars['Float']['output']>;
};

export enum CodeReviewState {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  COMMENTED = 'COMMENTED'
}

export type CodeReviewSubmittedEvent = {
  __typename?: 'CodeReviewSubmittedEvent';
  codeReview: CodeReview;
  eventAt: Scalars['DateTime']['output'];
};

export type CodeReviewsInput = {
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The date to filter from */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** The state to filter by */
  state?: InputMaybe<CodeReviewState>;
  /** The date to filter to */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DateTimeRange = {
  /** The start of the date range */
  from?: InputMaybe<Scalars['DateTime']['input']>;
  /** The end of the date range */
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DateTimeRangeValue = {
  __typename?: 'DateTimeRangeValue';
  /** The start of the date range */
  from?: Maybe<Scalars['DateTime']['output']>;
  /** The end of the date range */
  to?: Maybe<Scalars['DateTime']['output']>;
};

export enum DayOfTheWeek {
  FRIDAY = 'FRIDAY',
  MONDAY = 'MONDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  THURSDAY = 'THURSDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY'
}

export type Deployment = {
  __typename?: 'Deployment';
  /** The application that was deployed */
  application: Application;
  /** The time the deployment was archived */
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The person who triggered the deployment */
  author?: Maybe<Person>;
  /** The time the deployment was triggered */
  deployedAt: Scalars['DateTime']['output'];
  /** The description of the deployment */
  description?: Maybe<Scalars['String']['output']>;
  /** The environment that the deployment was deployed to */
  environment: Environment;
  id: Scalars['SweetID']['output'];
  /** The amount of pull requests that were deployed */
  pullRequestCount: Scalars['Int']['output'];
  /** The pull requests that were deployed */
  pullRequests: Array<PullRequest>;
  /** The version of the deployment */
  version: Scalars['String']['output'];
};

export type DeploymentFrequencyMetric = {
  __typename?: 'DeploymentFrequencyMetric';
  /** The average number of deployments per day */
  avg: Scalars['Float']['output'];
  /** The change in the number of deployments */
  change: Scalars['Float']['output'];
  /** The columns for the chart */
  columns: Array<Scalars['DateTime']['output']>;
  /** The amount of deployments for the current period */
  currentAmount: Scalars['BigInt']['output'];
  /** The date range for the current period */
  currentPeriod: DateTimeRangeValue;
  /** The amounts over time for the chart */
  data: Array<Scalars['BigInt']['output']>;
  /** The number of deployments before the current period */
  previousAmount: Scalars['BigInt']['output'];
  /** The date range for the previous period */
  previousPeriod: DateTimeRangeValue;
};

export type DeploymentSettings = {
  __typename?: 'DeploymentSettings';
  /** The subdirectory of the application. Useful for monorepos. */
  subdirectory?: Maybe<Scalars['String']['output']>;
  /** The target branch for merge-based deployments */
  targetBranch?: Maybe<Scalars['String']['output']>;
  /** The trigger for the deployment */
  trigger: DeploymentSettingsTrigger;
};

export type DeploymentSettingsInput = {
  /** The subdirectory of the application. Useful for monorepos. */
  subdirectory?: InputMaybe<Scalars['String']['input']>;
  /** The target branch for merge-based deployments */
  targetBranch?: InputMaybe<Scalars['String']['input']>;
  /** The trigger for the deployment */
  trigger: DeploymentSettingsTrigger;
};

/** The trigger for the deployment. */
export enum DeploymentSettingsTrigger {
  GIT_DEPLOYMENT = 'GIT_DEPLOYMENT',
  MERGE = 'MERGE',
  WEBHOOK = 'WEBHOOK'
}

export type DeploymentsQueryInput = {
  /** The applications to filter by */
  applicationIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** Whether to only include archived deployments. Defaults to false. */
  archivedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The time range the deployment went live */
  deployedAt?: InputMaybe<DateTimeRange>;
  /** The environments to filter by */
  environmentIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The ids to filter by */
  ids?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The amount of records to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The query to search by. Looks up by version and description. */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type Digest = {
  __typename?: 'Digest';
  channel: Scalars['String']['output'];
  dayOfTheWeek: Array<DayOfTheWeek>;
  enabled: Scalars['Boolean']['output'];
  frequency: DigestFrequency;
  settings: Scalars['JSONObject']['output'];
  timeOfDay: Scalars['String']['output'];
  timezone: Scalars['TimeZone']['output'];
  type: DigestType;
};

export enum DigestFrequency {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY'
}

export type DigestQueryInput = {
  type: DigestType;
};

export enum DigestType {
  TEAM_METRICS = 'TEAM_METRICS',
  TEAM_WIP = 'TEAM_WIP'
}

export type DoraMetrics = {
  __typename?: 'DoraMetrics';
  changeFailureRate: ChangeFailureRateMetric;
  deploymentFrequency: DeploymentFrequencyMetric;
  leadTime: LeadTimeMetric;
  meanTimeToRecover: MeanTimeToRecoverMetric;
};


export type DoraMetricsChangeFailureRateArgs = {
  input: WorkspaceMetricInput;
};


export type DoraMetricsDeploymentFrequencyArgs = {
  input: WorkspaceMetricInput;
};


export type DoraMetricsLeadTimeArgs = {
  input: WorkspaceMetricInput;
};


export type DoraMetricsMeanTimeToRecoverArgs = {
  input: WorkspaceMetricInput;
};

export type Environment = {
  __typename?: 'Environment';
  /** The time the environment was archived */
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['SweetID']['output'];
  /** Whether the environment is production */
  isProduction: Scalars['Boolean']['output'];
  /** The name of the environment */
  name: Scalars['String']['output'];
};

export type EnvironmentsQueryInput = {
  /** Whether to only include archived environments. Defaults to false. */
  archivedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The ids to filter by */
  ids?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The amount of records to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The query to search by. Looks up by name. */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type GraphChartLink = {
  __typename?: 'GraphChartLink';
  source: Scalars['String']['output'];
  target: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type Incident = {
  __typename?: 'Incident';
  /** The time the incident was archived */
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The deployment that caused the incident */
  causeDeployment: Deployment;
  /** The time the incident was detected */
  detectedAt: Scalars['DateTime']['output'];
  /** The deployment that fixed the incident */
  fixDeployment?: Maybe<Deployment>;
  id: Scalars['SweetID']['output'];
  /** The incident leader */
  leader?: Maybe<Person>;
  /** The url to the postmortem */
  postmortemUrl?: Maybe<Scalars['String']['output']>;
  /** The time the incident was resolved */
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The team responsible for handling the incident */
  team?: Maybe<Team>;
};

export type IncidentsQueryInput = {
  /** The applications to filter by */
  applicationIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** Whether to only include archived incidents. Defaults to false. */
  archivedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The time range the incident was detected in */
  detectedAt?: InputMaybe<DateTimeRange>;
  /** The environments to filter by */
  environmentIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The pagination limit */
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type InstallIntegrationInput = {
  app: IntegrationApp;
  code: Scalars['String']['input'];
  state: Scalars['String']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type Integration = {
  __typename?: 'Integration';
  app: IntegrationApp;
  enabledAt?: Maybe<Scalars['DateTime']['output']>;
  installUrl?: Maybe<Scalars['String']['output']>;
  isEnabled: Scalars['Boolean']['output'];
  target?: Maybe<Scalars['String']['output']>;
};

export enum IntegrationApp {
  SLACK = 'SLACK'
}

export type LeadTimeBreakdown = {
  __typename?: 'LeadTimeBreakdown';
  /** Time spent coding (first commit to PR creation) */
  codingTime: BreakdownStage;
  /** The date range for the current period */
  currentPeriod: DateTimeRangeValue;
  /** The date range for the previous period */
  previousPeriod: DateTimeRangeValue;
  /** Time from first review to approval */
  timeToApprove: BreakdownStage;
  /** Time from merge to deploy */
  timeToDeploy: BreakdownStage;
  /** Time waiting for first review */
  timeToFirstReview: BreakdownStage;
  /** Time from approval to merge */
  timeToMerge: BreakdownStage;
};

export type LeadTimeMetric = {
  __typename?: 'LeadTimeMetric';
  /** Breakdown of lead time by development stages */
  breakdown: LeadTimeBreakdown;
  /** The change in lead time */
  change: Scalars['Float']['output'];
  /** The columns for the chart */
  columns: Array<Scalars['DateTime']['output']>;
  /** The lead time in milliseconds for the current period */
  currentAmount: Scalars['BigInt']['output'];
  /** The date range for the current period */
  currentPeriod: DateTimeRangeValue;
  /** The amounts over time for the chart */
  data: Array<Scalars['BigInt']['output']>;
  /** The lead time in milliseconds before the current period */
  previousAmount: Scalars['BigInt']['output'];
  /** The date range for the previous period */
  previousPeriod: DateTimeRangeValue;
};

export type LoginToStripeInput = {
  workspaceId: Scalars['SweetID']['input'];
};

export type LoginWithGithubInput = {
  code: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export type LoginWithGithubResponse = {
  __typename?: 'LoginWithGithubResponse';
  redirectTo?: Maybe<Scalars['String']['output']>;
  token: Token;
};

export type MeanTimeToRecoverMetric = {
  __typename?: 'MeanTimeToRecoverMetric';
  /** The change in mean time to recover */
  change: Scalars['Float']['output'];
  /** The columns for the chart */
  columns: Array<Scalars['DateTime']['output']>;
  /** The mean time to recover in milliseconds for the current period */
  currentAmount: Scalars['BigInt']['output'];
  /** The date range for the current period */
  currentPeriod: DateTimeRangeValue;
  /** The amounts over time for the chart */
  data: Array<Scalars['BigInt']['output']>;
  /** The mean time to recover in milliseconds before the current period */
  previousAmount: Scalars['BigInt']['output'];
  /** The date range for the previous period */
  previousPeriod: DateTimeRangeValue;
};

export type Metrics = {
  __typename?: 'Metrics';
  codeReviewDistribution?: Maybe<CodeReviewDistributionChartData>;
  cycleTime?: Maybe<NumericChartData>;
  dora: DoraMetrics;
  pullRequestSizeDistribution?: Maybe<NumericSeriesChartData>;
  timeForApproval?: Maybe<NumericChartData>;
  timeForFirstReview?: Maybe<NumericChartData>;
  timeToMerge?: Maybe<NumericChartData>;
};


export type MetricsCodeReviewDistributionArgs = {
  input: TeamMetricInput;
};


export type MetricsCycleTimeArgs = {
  input: TeamMetricInput;
};


export type MetricsPullRequestSizeDistributionArgs = {
  input: TeamMetricInput;
};


export type MetricsTimeForApprovalArgs = {
  input: TeamMetricInput;
};


export type MetricsTimeForFirstReviewArgs = {
  input: TeamMetricInput;
};


export type MetricsTimeToMergeArgs = {
  input: TeamMetricInput;
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveApplication: Application;
  archiveDeployment: Deployment;
  archiveEnvironment: Environment;
  archiveIncident: Incident;
  archiveTeam: Team;
  installIntegration?: Maybe<Scalars['Void']['output']>;
  loginToStripe?: Maybe<Scalars['String']['output']>;
  loginWithGithub: LoginWithGithubResponse;
  regenerateApiKey: Scalars['String']['output'];
  removeIntegration?: Maybe<Scalars['Void']['output']>;
  scheduleSyncBatch: SyncBatch;
  sendTestMessage?: Maybe<Scalars['Void']['output']>;
  unarchiveApplication: Application;
  unarchiveDeployment: Deployment;
  unarchiveEnvironment: Environment;
  unarchiveIncident: Incident;
  unarchiveTeam: Team;
  updateAlert: Alert;
  updateAutomation: Automation;
  updateDigest: Digest;
  updateWorkspaceSettings: Workspace;
  upsertApplication: Application;
  upsertIncident: Incident;
  upsertTeam: Team;
};


export type MutationArchiveApplicationArgs = {
  input: ArchiveApplicationInput;
};


export type MutationArchiveDeploymentArgs = {
  input: ArchiveDeploymentInput;
};


export type MutationArchiveEnvironmentArgs = {
  input: ArchiveEnvironmentInput;
};


export type MutationArchiveIncidentArgs = {
  input: ArchiveIncidentInput;
};


export type MutationArchiveTeamArgs = {
  input: ArchiveTeamInput;
};


export type MutationInstallIntegrationArgs = {
  input: InstallIntegrationInput;
};


export type MutationLoginToStripeArgs = {
  input: LoginToStripeInput;
};


export type MutationLoginWithGithubArgs = {
  input: LoginWithGithubInput;
};


export type MutationRegenerateApiKeyArgs = {
  input: RegenerateApiKeyInput;
};


export type MutationRemoveIntegrationArgs = {
  input: RemoveIntegrationInput;
};


export type MutationScheduleSyncBatchArgs = {
  input: ScheduleSyncBatchInput;
};


export type MutationSendTestMessageArgs = {
  input: SendTestMessageInput;
};


export type MutationUnarchiveApplicationArgs = {
  input: UnarchiveApplicationInput;
};


export type MutationUnarchiveDeploymentArgs = {
  input: UnarchiveDeploymentInput;
};


export type MutationUnarchiveEnvironmentArgs = {
  input: UnarchiveEnvironmentInput;
};


export type MutationUnarchiveIncidentArgs = {
  input: UnarchiveIncidentInput;
};


export type MutationUnarchiveTeamArgs = {
  input: UnarchiveTeamInput;
};


export type MutationUpdateAlertArgs = {
  input: UpdateAlertInput;
};


export type MutationUpdateAutomationArgs = {
  input: UpdateAutomationInput;
};


export type MutationUpdateDigestArgs = {
  input: UpdateDigestInput;
};


export type MutationUpdateWorkspaceSettingsArgs = {
  input: UpdateWorkspaceSettingsInput;
};


export type MutationUpsertApplicationArgs = {
  input: UpsertApplicationInput;
};


export type MutationUpsertIncidentArgs = {
  input: UpsertIncidentInput;
};


export type MutationUpsertTeamArgs = {
  input: UpsertTeamInput;
};

export type NumericChartData = {
  __typename?: 'NumericChartData';
  columns: Array<Scalars['DateTime']['output']>;
  data: Array<Scalars['BigInt']['output']>;
};

export type NumericPersonalMetric = {
  __typename?: 'NumericPersonalMetric';
  /** The difference percentage between current vs previous */
  change: Scalars['Int']['output'];
  current: Scalars['Int']['output'];
  previous: Scalars['Int']['output'];
};

export type NumericSeriesChartData = {
  __typename?: 'NumericSeriesChartData';
  columns: Array<Scalars['DateTime']['output']>;
  series: Array<ChartNumericSeries>;
};

export type PeopleQueryInput = {
  /** The pagination cursor. */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The ids to filter by. */
  ids?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The amount of records to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The query to search by. Looks up by name, email and git handle. */
  query?: InputMaybe<Scalars['String']['input']>;
};

export enum Period {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY'
}

export type Person = {
  __typename?: 'Person';
  avatar?: Maybe<Scalars['String']['output']>;
  codeReviews: Array<CodeReview>;
  email?: Maybe<Scalars['String']['output']>;
  handle: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  name: Scalars['String']['output'];
  personalMetrics: PersonalMetrics;
  teamMemberships: Array<TeamMember>;
  teammates: Array<TeamMember>;
};


export type PersonCodeReviewsArgs = {
  input?: InputMaybe<CodeReviewsInput>;
};

/** Personal improvement metrics over the last 30 days vs previous period */
export type PersonalMetrics = {
  __typename?: 'PersonalMetrics';
  codeReviewAmount: NumericPersonalMetric;
  pullRequestSize: NumericPersonalMetric;
};

export type PlanKeys = {
  __typename?: 'PlanKeys';
  monthly: Scalars['String']['output'];
  yearly: Scalars['String']['output'];
};

export type PullRequest = {
  __typename?: 'PullRequest';
  /** The author */
  author: Person;
  /** The amount of files changed */
  changedFilesCount: Scalars['Int']['output'];
  /** The time when the pull request was closed */
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The amount of comments */
  commentCount: Scalars['Int']['output'];
  /** The time when the pull request was created */
  createdAt: Scalars['DateTime']['output'];
  /** The external git url */
  gitUrl: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  /** The amount of lines added */
  linesAddedCount: Scalars['Int']['output'];
  /** The amount of lines deleted */
  linesDeletedCount: Scalars['Int']['output'];
  /** The time when the pull request was merged */
  mergedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The repository */
  repository: Repository;
  /** The state of the pull request */
  state: PullRequestState;
  /** The title */
  title: Scalars['String']['output'];
  /** The tracking information */
  tracking: PullRequestTracking;
};

export type PullRequestCreatedEvent = {
  __typename?: 'PullRequestCreatedEvent';
  eventAt: Scalars['DateTime']['output'];
  pullRequest: PullRequest;
};

export type PullRequestMergedEvent = {
  __typename?: 'PullRequestMergedEvent';
  eventAt: Scalars['DateTime']['output'];
  pullRequest: PullRequest;
};

export enum PullRequestOwnerType {
  PERSON = 'PERSON',
  TEAM = 'TEAM'
}

export enum PullRequestSize {
  HUGE = 'HUGE',
  LARGE = 'LARGE',
  MEDIUM = 'MEDIUM',
  SMALL = 'SMALL',
  TINY = 'TINY'
}

export enum PullRequestState {
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
  MERGED = 'MERGED',
  OPEN = 'OPEN'
}

export type PullRequestTracking = {
  __typename?: 'PullRequestTracking';
  /** The amount of files changed (ignores auto-generated files) */
  changedFilesCount: Scalars['Int']['output'];
  /** The duration, in milliseconds, between the first commit and the time it was merged */
  cycleTime?: Maybe<Scalars['BigInt']['output']>;
  /** The time when the pull request received its first approval */
  firstApprovalAt?: Maybe<Scalars['DateTime']['output']>;
  /** The time when the pull request was deployed */
  firstDeployedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The time when the pull request received its first review */
  firstReviewAt?: Maybe<Scalars['DateTime']['output']>;
  /** The amount of lines added (ignores auto-generated files) */
  linesAddedCount: Scalars['Int']['output'];
  /** The amount of lines deleted (ignores auto-generated files) */
  linesDeletedCount: Scalars['Int']['output'];
  /** The size of the pull request */
  size: PullRequestSize;
  /** The duration, in milliseconds, between the first commit and the time it was ready for review */
  timeToCode?: Maybe<Scalars['BigInt']['output']>;
  /** The duration, in milliseconds, between the pull request being merged and being deployed */
  timeToDeploy?: Maybe<Scalars['BigInt']['output']>;
  /** The duration, in milliseconds, between the time the first reviewer was requested and the time it received its first approval */
  timeToFirstApproval?: Maybe<Scalars['BigInt']['output']>;
  /** The duration, in milliseconds, between the time the first reviewer was requested and the time it received its first review */
  timeToFirstReview?: Maybe<Scalars['BigInt']['output']>;
  /** The duration, in milliseconds, between the first approval of the Pull Request and the time it was merged. Compares with creation date when merged without reviews */
  timeToMerge?: Maybe<Scalars['BigInt']['output']>;
};

export type PullRequestTrendInput = {
  state?: InputMaybe<PullRequestState>;
};

export type PullRequestsInProgressResponse = {
  __typename?: 'PullRequestsInProgressResponse';
  changesRequested: Array<PullRequest>;
  drafted: Array<PullRequest>;
  pendingMerge: Array<PullRequest>;
  pendingReview: Array<PullRequest>;
};

export type PullRequestsQueryInput = {
  /** The time range the pull request was merged or closed */
  completedAt?: InputMaybe<DateTimeRange>;
  /** The time range the pull request was created in */
  createdAt?: InputMaybe<DateTimeRange>;
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The ids to filter by */
  ownerIds: Array<Scalars['SweetID']['input']>;
  /** Whether the ids refer to teams or people */
  ownerType: PullRequestOwnerType;
  /** The size to filter by */
  sizes?: InputMaybe<Array<PullRequestSize>>;
  /** The state to filter by */
  states?: InputMaybe<Array<PullRequestState>>;
};

export type PurchasablePlans = {
  __typename?: 'PurchasablePlans';
  cloud: PlanKeys;
};

export type Query = {
  __typename?: 'Query';
  authProvider: AuthProviderResponse;
  userWorkspaces: Array<Workspace>;
  workspace: Workspace;
  workspaceByInstallationId?: Maybe<Workspace>;
};


export type QueryAuthProviderArgs = {
  input: AuthProviderInput;
};


export type QueryWorkspaceArgs = {
  workspaceId: Scalars['SweetID']['input'];
};


export type QueryWorkspaceByInstallationIdArgs = {
  gitInstallationId: Scalars['String']['input'];
};

export type RegenerateApiKeyInput = {
  workspaceId: Scalars['SweetID']['input'];
};

export type RemoveIntegrationInput = {
  app: IntegrationApp;
  workspaceId: Scalars['SweetID']['input'];
};

export type RepositoriesQueryInput = {
  /** The pagination cursor. */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The ids to filter by. */
  ids?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The amount of records to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The query to search by. Looks up by name. */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type Repository = {
  __typename?: 'Repository';
  fullName: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  name: Scalars['String']['output'];
};

export type ScheduleSyncBatchInput = {
  /** How far back to resync data from */
  sinceDaysAgo: Scalars['Int']['input'];
  /** The workspace id */
  workspaceId: Scalars['SweetID']['input'];
};

export type SendTestMessageInput = {
  app: IntegrationApp;
  channel: Scalars['String']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  isActive: Scalars['Boolean']['output'];
};

export type SyncBatch = {
  __typename?: 'SyncBatch';
  /** The date and time the sync batch was finished */
  finishedAt?: Maybe<Scalars['DateTime']['output']>;
  /** The id of the sync batch */
  id: Scalars['SweetID']['output'];
  /** A number between 0 and 100 representing the progress of the sync batch */
  progress: Scalars['Int']['output'];
  /** The date and time the sync batch was scheduled for */
  scheduledAt: Scalars['DateTime']['output'];
  /** How far back to resync data from */
  sinceDaysAgo: Scalars['Int']['output'];
};

export type Team = {
  __typename?: 'Team';
  alert?: Maybe<Alert>;
  alerts: Array<Alert>;
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  digest?: Maybe<Digest>;
  digests: Array<Digest>;
  endColor: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  members: Array<TeamMember>;
  name: Scalars['String']['output'];
  pullRequestsInProgress: PullRequestsInProgressResponse;
  startColor: Scalars['String']['output'];
  workLog: TeamWorkLogResponse;
};


export type TeamAlertArgs = {
  input: AlertQueryInput;
};


export type TeamDigestArgs = {
  input: DigestQueryInput;
};


export type TeamWorkLogArgs = {
  input: TeamWorkLogInput;
};

export type TeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['SweetID']['output'];
  person: Person;
  role: TeamMemberRole;
  team: Team;
};

export enum TeamMemberRole {
  DESIGNER = 'DESIGNER',
  ENGINEER = 'ENGINEER',
  LEADER = 'LEADER',
  MANAGER = 'MANAGER',
  PRODUCT = 'PRODUCT',
  QA = 'QA'
}

export type TeamMetricInput = {
  /** The date range. */
  dateRange: DateTimeRange;
  /** The period to group by. */
  period: Period;
  /** The team id to filter by. */
  teamId: Scalars['SweetID']['input'];
};

export type TeamWorkLogInput = {
  /** The date range. */
  dateRange: DateTimeRange;
};

export type TeamWorkLogResponse = {
  __typename?: 'TeamWorkLogResponse';
  columns: Array<Scalars['DateTime']['output']>;
  data: Array<ActivityEvent>;
};

export type TeamsQueryInput = {
  /** Whether to only include archived teams. Defaults to false. */
  archivedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  /** The ids to filter by. */
  ids?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The amount of records to return. */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The query to search by. Looks up by name. */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type Token = {
  __typename?: 'Token';
  accessToken: Scalars['String']['output'];
};

export type Trial = {
  __typename?: 'Trial';
  endAt: Scalars['DateTime']['output'];
};

export type UnarchiveApplicationInput = {
  applicationId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type UnarchiveDeploymentInput = {
  deploymentId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type UnarchiveEnvironmentInput = {
  environmentId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type UnarchiveIncidentInput = {
  incidentId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type UnarchiveTeamInput = {
  teamId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type UpdateAlertInput = {
  channel: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
  settings: Scalars['JSONObject']['input'];
  teamId: Scalars['SweetID']['input'];
  type: AlertType;
  workspaceId: Scalars['SweetID']['input'];
};

export type UpdateAutomationInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  settings?: InputMaybe<Scalars['JSONObject']['input']>;
  type: AutomationType;
  workspaceId: Scalars['SweetID']['input'];
};

export type UpdateDigestInput = {
  channel: Scalars['String']['input'];
  dayOfTheWeek: Array<DayOfTheWeek>;
  enabled: Scalars['Boolean']['input'];
  frequency: DigestFrequency;
  settings: Scalars['JSONObject']['input'];
  teamId: Scalars['SweetID']['input'];
  timeOfDay: Scalars['String']['input'];
  timezone: Scalars['TimeZone']['input'];
  type: DigestType;
  workspaceId: Scalars['SweetID']['input'];
};

export type UpdateWorkspaceSettingsInput = {
  settings: WorkspaceSettingsInput;
  workspaceId: Scalars['SweetID']['input'];
};

export type UpsertApplicationInput = {
  /** The application id, specify when updating an existing application. */
  applicationId?: InputMaybe<Scalars['SweetID']['input']>;
  /** The deployment settings for the application */
  deploymentSettings: DeploymentSettingsInput;
  /** The description of the application */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The name of the application */
  name: Scalars['String']['input'];
  /** The repository id */
  repositoryId: Scalars['SweetID']['input'];
  /** The team id, specify when updating an existing team. */
  teamId?: InputMaybe<Scalars['SweetID']['input']>;
  /** The workspace id */
  workspaceId: Scalars['SweetID']['input'];
};

export type UpsertIncidentInput = {
  /** The deployment that caused the incident */
  causeDeploymentId: Scalars['SweetID']['input'];
  /** The time the incident was detected */
  detectedAt: Scalars['DateTime']['input'];
  /** The deployment that fixed the incident */
  fixDeploymentId?: InputMaybe<Scalars['SweetID']['input']>;
  /** The incident id, specify when updating an existing incident. */
  incidentId?: InputMaybe<Scalars['SweetID']['input']>;
  /** The incident leader */
  leaderId?: InputMaybe<Scalars['SweetID']['input']>;
  /** The url to the postmortem */
  postmortemUrl?: InputMaybe<Scalars['String']['input']>;
  /** The time the incident was resolved */
  resolvedAt?: InputMaybe<Scalars['DateTime']['input']>;
  /** The team responsible for handling the incident */
  teamId?: InputMaybe<Scalars['SweetID']['input']>;
  /** The workspace id */
  workspaceId: Scalars['SweetID']['input'];
};

export type UpsertTeamInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endColor: Scalars['String']['input'];
  icon: Scalars['String']['input'];
  members: Array<UpsertTeamMemberInput>;
  name: Scalars['String']['input'];
  startColor: Scalars['String']['input'];
  /** The team id, specify when updating an existing team. */
  teamId?: InputMaybe<Scalars['SweetID']['input']>;
  workspaceId: Scalars['SweetID']['input'];
};

export type UpsertTeamMemberInput = {
  personId: Scalars['SweetID']['input'];
  role: TeamMemberRole;
};

export type Workspace = {
  __typename?: 'Workspace';
  apiKey?: Maybe<ApiKey>;
  application?: Maybe<Application>;
  applications: Array<Application>;
  automation?: Maybe<Automation>;
  automations: Array<Automation>;
  avatar?: Maybe<Scalars['String']['output']>;
  billing?: Maybe<Billing>;
  deployment?: Maybe<Deployment>;
  deployments: Array<Deployment>;
  environments: Array<Environment>;
  /** Information about which features has been tried out by the workspace */
  featureAdoption: WorkspaceFeatureAdoption;
  /** The git provider URL to uninstall the sweetr app */
  gitUninstallUrl: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  incident?: Maybe<Incident>;
  incidents: Array<Incident>;
  /** A number between 0 and 100 representing the progress of the initial data synchronization with the git provider */
  initialSyncProgress: Scalars['Int']['output'];
  integrations: Array<Integration>;
  /** Whether the workspace should have access to the dashboard */
  isActiveCustomer: Scalars['Boolean']['output'];
  lastSyncBatch?: Maybe<SyncBatch>;
  me?: Maybe<Person>;
  metrics: Metrics;
  name: Scalars['String']['output'];
  people: Array<Person>;
  person?: Maybe<Person>;
  pullRequests: Array<PullRequest>;
  repositories: Array<Repository>;
  settings: WorkspaceSettings;
  team?: Maybe<Team>;
  teams: Array<Team>;
};


export type WorkspaceApplicationArgs = {
  applicationId: Scalars['SweetID']['input'];
};


export type WorkspaceApplicationsArgs = {
  input: ApplicationsQueryInput;
};


export type WorkspaceAutomationArgs = {
  input: AutomationQueryInput;
};


export type WorkspaceDeploymentArgs = {
  deploymentId: Scalars['SweetID']['input'];
};


export type WorkspaceDeploymentsArgs = {
  input: DeploymentsQueryInput;
};


export type WorkspaceEnvironmentsArgs = {
  input: EnvironmentsQueryInput;
};


export type WorkspaceIncidentArgs = {
  incidentId: Scalars['SweetID']['input'];
};


export type WorkspaceIncidentsArgs = {
  input: IncidentsQueryInput;
};


export type WorkspacePeopleArgs = {
  input?: InputMaybe<PeopleQueryInput>;
};


export type WorkspacePersonArgs = {
  handle: Scalars['String']['input'];
};


export type WorkspacePullRequestsArgs = {
  input: PullRequestsQueryInput;
};


export type WorkspaceRepositoriesArgs = {
  input?: InputMaybe<RepositoriesQueryInput>;
};


export type WorkspaceTeamArgs = {
  teamId: Scalars['SweetID']['input'];
};


export type WorkspaceTeamsArgs = {
  input?: InputMaybe<TeamsQueryInput>;
};

export type WorkspaceFeatureAdoption = {
  __typename?: 'WorkspaceFeatureAdoption';
  lastDeploymentCreatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type WorkspaceMetricInput = {
  /** The application ids to filter by. */
  applicationIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The date range. */
  dateRange: DateTimeRange;
  /** The environment ids to filter by. */
  environmentIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The period to group by. */
  period: Period;
  /** The repository ids to filter by. */
  repositoryIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
  /** The team ids to filter by. */
  teamIds?: InputMaybe<Array<Scalars['SweetID']['input']>>;
};

export type WorkspaceSettings = {
  __typename?: 'WorkspaceSettings';
  pullRequest: WorkspaceSettingsPullRequest;
};

export type WorkspaceSettingsInput = {
  pullRequest?: InputMaybe<WorkspaceSettingsPullRequestInput>;
};

export type WorkspaceSettingsPullRequest = {
  __typename?: 'WorkspaceSettingsPullRequest';
  size: WorkspaceSettingsPullRequestSize;
};

export type WorkspaceSettingsPullRequestInput = {
  size?: InputMaybe<WorkspaceSettingsPullRequestSizeInput>;
};

export type WorkspaceSettingsPullRequestSize = {
  __typename?: 'WorkspaceSettingsPullRequestSize';
  ignorePatterns: Array<Scalars['String']['output']>;
  large: Scalars['Int']['output'];
  medium: Scalars['Int']['output'];
  small: Scalars['Int']['output'];
  tiny: Scalars['Int']['output'];
};

export type WorkspaceSettingsPullRequestSizeInput = {
  ignorePatterns?: InputMaybe<Array<Scalars['String']['input']>>;
  large?: InputMaybe<Scalars['Int']['input']>;
  medium?: InputMaybe<Scalars['Int']['input']>;
  small?: InputMaybe<Scalars['Int']['input']>;
  tiny?: InputMaybe<Scalars['Int']['input']>;
};

export type TeamAlertsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
}>;


export type TeamAlertsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', team?: { __typename?: 'Team', alerts: Array<{ __typename?: 'Alert', type: AlertType, enabled: boolean }> } | null } };

export type TeamAlertQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
  input: AlertQueryInput;
}>;


export type TeamAlertQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', team?: { __typename?: 'Team', alert?: { __typename?: 'Alert', type: AlertType, enabled: boolean, channel: string, settings: object } | null } | null } };

export type UpdateAlertMutationVariables = Exact<{
  input: UpdateAlertInput;
}>;


export type UpdateAlertMutation = { __typename?: 'Mutation', updateAlert: { __typename?: 'Alert', type: AlertType, enabled: boolean } };

export type WorkspaceApiKeyQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type WorkspaceApiKeyQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', apiKey?: { __typename?: 'ApiKey', id: string, createdAt: string, lastUsedAt?: string | null, creator: { __typename?: 'Person', id: string, handle: string, name: string } } | null } };

export type RegenerateApiKeyMutationVariables = Exact<{
  input: RegenerateApiKeyInput;
}>;


export type RegenerateApiKeyMutation = { __typename?: 'Mutation', regenerateApiKey: string };

export type ApplicationQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  applicationId: Scalars['SweetID']['input'];
}>;


export type ApplicationQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', application?: { __typename?: 'Application', id: string, name: string, description?: string | null, archivedAt?: string | null, team?: { __typename?: 'Team', id: string, name: string, icon: string } | null, repository: { __typename?: 'Repository', id: string, name: string }, deploymentSettings: { __typename?: 'DeploymentSettings', trigger: DeploymentSettingsTrigger, subdirectory?: string | null, targetBranch?: string | null } } | null } };

export type ApplicationOptionsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: ApplicationsQueryInput;
}>;


export type ApplicationOptionsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', applications: Array<{ __typename?: 'Application', id: string, name: string, description?: string | null, team?: { __typename?: 'Team', id: string, name: string, icon: string } | null }> } };

export type ApplicationsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: ApplicationsQueryInput;
}>;


export type ApplicationsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', applications: Array<{ __typename?: 'Application', id: string, name: string, description?: string | null, archivedAt?: string | null, team?: { __typename?: 'Team', id: string, name: string, icon: string, startColor: string, endColor: string } | null, repository: { __typename?: 'Repository', id: string, fullName: string }, lastProductionDeployment?: { __typename?: 'Deployment', id: string, version: string, deployedAt: string } | null }> } };

export type UpsertApplicationMutationVariables = Exact<{
  input: UpsertApplicationInput;
}>;


export type UpsertApplicationMutation = { __typename?: 'Mutation', upsertApplication: { __typename?: 'Application', id: string } };

export type ArchiveApplicationMutationVariables = Exact<{
  input: ArchiveApplicationInput;
}>;


export type ArchiveApplicationMutation = { __typename?: 'Mutation', archiveApplication: { __typename?: 'Application', id: string, name: string, description?: string | null, archivedAt?: string | null } };

export type UnarchiveApplicationMutationVariables = Exact<{
  input: UnarchiveApplicationInput;
}>;


export type UnarchiveApplicationMutation = { __typename?: 'Mutation', unarchiveApplication: { __typename?: 'Application', id: string, name: string, description?: string | null, archivedAt?: string | null } };

export type LoginWithGithubMutationVariables = Exact<{
  input: LoginWithGithubInput;
}>;


export type LoginWithGithubMutation = { __typename?: 'Mutation', loginWithGithub: { __typename?: 'LoginWithGithubResponse', token: { __typename?: 'Token', accessToken: string } } };

export type AuthProviderQueryVariables = Exact<{
  input: AuthProviderInput;
}>;


export type AuthProviderQuery = { __typename?: 'Query', authProvider: { __typename?: 'AuthProviderResponse', redirectUrl: string } };

export type WorkspaceAutomationQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: AutomationQueryInput;
}>;


export type WorkspaceAutomationQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', automation?: { __typename?: 'Automation', type: AutomationType, enabled: boolean, settings?: object | null } | null } };

export type WorkspaceAutomationsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type WorkspaceAutomationsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', automations: Array<{ __typename?: 'Automation', type: AutomationType, enabled: boolean }> } };

export type UpdateAutomationMutationVariables = Exact<{
  input: UpdateAutomationInput;
}>;


export type UpdateAutomationMutation = { __typename?: 'Mutation', updateAutomation: { __typename?: 'Automation', type: AutomationType, enabled: boolean, settings?: object | null } };

export type BillingQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type BillingQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', billing?: { __typename?: 'Billing', estimatedSeats: number, purchasablePlans?: { __typename?: 'PurchasablePlans', cloud: { __typename?: 'PlanKeys', monthly: string, yearly: string } } | null } | null } };

export type LoginToStripeMutationVariables = Exact<{
  input: LoginToStripeInput;
}>;


export type LoginToStripeMutation = { __typename?: 'Mutation', loginToStripe?: string | null };

export type PersonCodeReviewsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  handle: Scalars['String']['input'];
  input?: InputMaybe<CodeReviewsInput>;
}>;


export type PersonCodeReviewsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', person?: { __typename?: 'Person', codeReviews: Array<{ __typename?: 'CodeReview', id: string, state: CodeReviewState, commentCount: number, createdAt: string, author: { __typename?: 'Person', id: string, name: string, handle: string, avatar?: string | null }, pullRequest: { __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, firstReviewAt?: string | null, timeToFirstReview?: number | null }, author: { __typename?: 'Person', id: string, name: string, handle: string, avatar?: string | null }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } } }> } | null } };

export type DeploymentOptionsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: DeploymentsQueryInput;
}>;


export type DeploymentOptionsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', deployments: Array<{ __typename?: 'Deployment', id: string, description?: string | null, version: string, deployedAt: string, application: { __typename?: 'Application', id: string, name: string } }> } };

export type DeploymentsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: DeploymentsQueryInput;
}>;


export type DeploymentsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', deployments: Array<{ __typename?: 'Deployment', id: string, version: string, description?: string | null, deployedAt: string, archivedAt?: string | null, pullRequestCount: number, application: { __typename?: 'Application', id: string, name: string }, environment: { __typename?: 'Environment', name: string, isProduction: boolean }, author?: { __typename?: 'Person', id: string, name: string, avatar?: string | null } | null }> } };

export type DeploymentQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  deploymentId: Scalars['SweetID']['input'];
}>;


export type DeploymentQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', deployment?: { __typename?: 'Deployment', id: string, version: string, description?: string | null, deployedAt: string, archivedAt?: string | null, application: { __typename?: 'Application', id: string, name: string, repository: { __typename?: 'Repository', fullName: string } }, environment: { __typename?: 'Environment', name: string, isProduction: boolean }, author?: { __typename?: 'Person', id: string, name: string, avatar?: string | null } | null, pullRequests: Array<{ __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } }> } | null } };

export type ArchiveDeploymentMutationVariables = Exact<{
  input: ArchiveDeploymentInput;
}>;


export type ArchiveDeploymentMutation = { __typename?: 'Mutation', archiveDeployment: { __typename?: 'Deployment', id: string, version: string, description?: string | null, deployedAt: string, archivedAt?: string | null } };

export type UnarchiveDeploymentMutationVariables = Exact<{
  input: UnarchiveDeploymentInput;
}>;


export type UnarchiveDeploymentMutation = { __typename?: 'Mutation', unarchiveDeployment: { __typename?: 'Deployment', id: string, version: string, description?: string | null, deployedAt: string, archivedAt?: string | null } };

export type TeamDigestsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
}>;


export type TeamDigestsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', team?: { __typename?: 'Team', digests: Array<{ __typename?: 'Digest', type: DigestType, enabled: boolean }> } | null } };

export type TeamDigestQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
  input: DigestQueryInput;
}>;


export type TeamDigestQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', team?: { __typename?: 'Team', digest?: { __typename?: 'Digest', type: DigestType, enabled: boolean, channel: string, frequency: DigestFrequency, dayOfTheWeek: Array<DayOfTheWeek>, timeOfDay: string, timezone: string, settings: object } | null } | null } };

export type UpdateDigestMutationVariables = Exact<{
  input: UpdateDigestInput;
}>;


export type UpdateDigestMutation = { __typename?: 'Mutation', updateDigest: { __typename?: 'Digest', type: DigestType, enabled: boolean } };

export type DoraMetricsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: WorkspaceMetricInput;
}>;


export type DoraMetricsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', dora: { __typename?: 'DoraMetrics', deploymentFrequency: { __typename?: 'DeploymentFrequencyMetric', currentAmount: number, previousAmount: number, change: number, columns: Array<string>, data: Array<number>, avg: number, currentPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null }, previousPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null } }, leadTime: { __typename?: 'LeadTimeMetric', currentAmount: number, previousAmount: number, change: number, columns: Array<string>, data: Array<number>, currentPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null }, previousPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null }, breakdown: { __typename?: 'LeadTimeBreakdown', codingTime: { __typename?: 'BreakdownStage', currentAmount: number, previousAmount: number, change: number }, timeToFirstReview: { __typename?: 'BreakdownStage', currentAmount: number, previousAmount: number, change: number }, timeToApprove: { __typename?: 'BreakdownStage', currentAmount: number, previousAmount: number, change: number }, timeToMerge: { __typename?: 'BreakdownStage', currentAmount: number, previousAmount: number, change: number }, timeToDeploy: { __typename?: 'BreakdownStage', currentAmount: number, previousAmount: number, change: number } } }, changeFailureRate: { __typename?: 'ChangeFailureRateMetric', currentAmount: number, previousAmount: number, change: number, columns: Array<string>, data: Array<number>, currentPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null }, previousPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null } }, meanTimeToRecover: { __typename?: 'MeanTimeToRecoverMetric', currentAmount: number, previousAmount: number, change: number, columns: Array<string>, data: Array<number>, currentPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null }, previousPeriod: { __typename?: 'DateTimeRangeValue', from?: string | null, to?: string | null } } } } } };

export type EnvironmentOptionsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: EnvironmentsQueryInput;
}>;


export type EnvironmentOptionsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', environments: Array<{ __typename?: 'Environment', id: string, name: string, isProduction: boolean }> } };

export type EnvironmentsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: EnvironmentsQueryInput;
}>;


export type EnvironmentsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', environments: Array<{ __typename?: 'Environment', id: string, name: string, isProduction: boolean, archivedAt?: string | null }> } };

export type ArchiveEnvironmentMutationVariables = Exact<{
  input: ArchiveEnvironmentInput;
}>;


export type ArchiveEnvironmentMutation = { __typename?: 'Mutation', archiveEnvironment: { __typename?: 'Environment', id: string, name: string, isProduction: boolean, archivedAt?: string | null } };

export type UnarchiveEnvironmentMutationVariables = Exact<{
  input: UnarchiveEnvironmentInput;
}>;


export type UnarchiveEnvironmentMutation = { __typename?: 'Mutation', unarchiveEnvironment: { __typename?: 'Environment', id: string, name: string, isProduction: boolean, archivedAt?: string | null } };

export type IncidentsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: IncidentsQueryInput;
}>;


export type IncidentsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', incidents: Array<{ __typename?: 'Incident', id: string, detectedAt: string, resolvedAt?: string | null, postmortemUrl?: string | null, archivedAt?: string | null, team?: { __typename?: 'Team', id: string, name: string, icon: string } | null, leader?: { __typename?: 'Person', id: string, name: string, avatar?: string | null } | null, causeDeployment: { __typename?: 'Deployment', id: string, version: string, application: { __typename?: 'Application', id: string, name: string } }, fixDeployment?: { __typename?: 'Deployment', id: string, version: string, application: { __typename?: 'Application', id: string, name: string } } | null }> } };

export type IncidentQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  incidentId: Scalars['SweetID']['input'];
}>;


export type IncidentQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', incident?: { __typename?: 'Incident', id: string, detectedAt: string, resolvedAt?: string | null, postmortemUrl?: string | null, archivedAt?: string | null, team?: { __typename?: 'Team', id: string, name: string, icon: string } | null, leader?: { __typename?: 'Person', id: string, name: string, avatar?: string | null } | null, causeDeployment: { __typename?: 'Deployment', id: string, version: string, application: { __typename?: 'Application', id: string, name: string } }, fixDeployment?: { __typename?: 'Deployment', id: string, version: string, application: { __typename?: 'Application', id: string, name: string } } | null } | null } };

export type UpsertIncidentMutationVariables = Exact<{
  input: UpsertIncidentInput;
}>;


export type UpsertIncidentMutation = { __typename?: 'Mutation', upsertIncident: { __typename?: 'Incident', id: string } };

export type ArchiveIncidentMutationVariables = Exact<{
  input: ArchiveIncidentInput;
}>;


export type ArchiveIncidentMutation = { __typename?: 'Mutation', archiveIncident: { __typename?: 'Incident', id: string, detectedAt: string, resolvedAt?: string | null, archivedAt?: string | null } };

export type UnarchiveIncidentMutationVariables = Exact<{
  input: UnarchiveIncidentInput;
}>;


export type UnarchiveIncidentMutation = { __typename?: 'Mutation', unarchiveIncident: { __typename?: 'Incident', id: string, detectedAt: string, resolvedAt?: string | null, archivedAt?: string | null } };

export type WorkspaceIntegrationsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type WorkspaceIntegrationsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', integrations: Array<{ __typename?: 'Integration', app: IntegrationApp, isEnabled: boolean, installUrl?: string | null, enabledAt?: string | null, target?: string | null }> } };

export type InstallIntegrationMutationVariables = Exact<{
  input: InstallIntegrationInput;
}>;


export type InstallIntegrationMutation = { __typename?: 'Mutation', installIntegration?: null | null };

export type RemoveIntegrationMutationVariables = Exact<{
  input: RemoveIntegrationInput;
}>;


export type RemoveIntegrationMutation = { __typename?: 'Mutation', removeIntegration?: null | null };

export type SendTestMessageMutationVariables = Exact<{
  input: SendTestMessageInput;
}>;


export type SendTestMessageMutation = { __typename?: 'Mutation', sendTestMessage?: null | null };

export type PeopleQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input?: InputMaybe<PeopleQueryInput>;
}>;


export type PeopleQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', people: Array<{ __typename?: 'Person', id: string, name: string, handle: string, avatar?: string | null }> } };

export type PersonQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  handle: Scalars['String']['input'];
}>;


export type PersonQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', person?: { __typename?: 'Person', id: string, name: string, handle: string, avatar?: string | null, teamMemberships: Array<{ __typename?: 'TeamMember', id: string, role: TeamMemberRole, team: { __typename?: 'Team', id: string, name: string, icon: string } }> } | null } };

export type PersonalMetricsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type PersonalMetricsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', me?: { __typename?: 'Person', personalMetrics: { __typename?: 'PersonalMetrics', pullRequestSize: { __typename?: 'NumericPersonalMetric', current: number, previous: number, change: number }, codeReviewAmount: { __typename?: 'NumericPersonalMetric', current: number, previous: number, change: number } } } | null } };

export type ChartTimeToMergeQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamMetricInput;
}>;


export type ChartTimeToMergeQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', timeToMerge?: { __typename?: 'NumericChartData', columns: Array<string>, data: Array<number> } | null } } };

export type ChartTimeToFirstReviewQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamMetricInput;
}>;


export type ChartTimeToFirstReviewQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', timeForFirstReview?: { __typename?: 'NumericChartData', columns: Array<string>, data: Array<number> } | null } } };

export type ChartTimeToApprovalQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamMetricInput;
}>;


export type ChartTimeToApprovalQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', timeForApproval?: { __typename?: 'NumericChartData', columns: Array<string>, data: Array<number> } | null } } };

export type ChartCycleTimeQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamMetricInput;
}>;


export type ChartCycleTimeQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', cycleTime?: { __typename?: 'NumericChartData', columns: Array<string>, data: Array<number> } | null } } };

export type PullRequestSizeDistributionQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamMetricInput;
}>;


export type PullRequestSizeDistributionQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', pullRequestSizeDistribution?: { __typename?: 'NumericSeriesChartData', columns: Array<string>, series: Array<{ __typename?: 'ChartNumericSeries', name: string, data: Array<number>, color?: string | null }> } | null } } };

export type ChartCodeReviewDistributionQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamMetricInput;
}>;


export type ChartCodeReviewDistributionQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', metrics: { __typename?: 'Metrics', codeReviewDistribution?: { __typename?: 'CodeReviewDistributionChartData', totalReviews: number, entities: Array<{ __typename?: 'CodeReviewDistributionEntity', id: string, name: string, image?: string | null, reviewCount?: number | null, reviewSharePercentage?: number | null }>, links: Array<{ __typename?: 'GraphChartLink', source: string, target: string, value: number }> } | null } } };

export type PullRequestsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: PullRequestsQueryInput;
}>;


export type PullRequestsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', pullRequests: Array<{ __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } }> } };

export type RepositoriesQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input?: InputMaybe<RepositoriesQueryInput>;
}>;


export type RepositoriesQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', repositories: Array<{ __typename?: 'Repository', id: string, name: string, fullName: string }> } };

export type SpotlightQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  peopleInput: PeopleQueryInput;
  teamsInput: TeamsQueryInput;
  repositoriesInput: RepositoriesQueryInput;
  applicationsInput: ApplicationsQueryInput;
}>;


export type SpotlightQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', people: Array<{ __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }>, teams: Array<{ __typename?: 'Team', id: string, name: string, description?: string | null, icon: string, startColor: string, endColor: string }>, repositories: Array<{ __typename?: 'Repository', id: string, name: string, fullName: string }>, applications: Array<{ __typename?: 'Application', id: string, name: string, description?: string | null }> } };

export type WorkspaceLastSyncBatchQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type WorkspaceLastSyncBatchQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', lastSyncBatch?: { __typename?: 'SyncBatch', scheduledAt: string, finishedAt?: string | null, sinceDaysAgo: number, progress: number } | null } };

export type ScheduleSyncBatchMutationVariables = Exact<{
  input: ScheduleSyncBatchInput;
}>;


export type ScheduleSyncBatchMutation = { __typename?: 'Mutation', scheduleSyncBatch: { __typename?: 'SyncBatch', scheduledAt: string, finishedAt?: string | null, sinceDaysAgo: number } };

export type TeamsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input?: InputMaybe<TeamsQueryInput>;
}>;


export type TeamsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', teams: Array<{ __typename?: 'Team', id: string, name: string, description?: string | null, icon: string, startColor: string, endColor: string, archivedAt?: string | null, members: Array<{ __typename?: 'TeamMember', id: string, person: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string } }> }> } };

export type TeamQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
}>;


export type TeamQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', team?: { __typename?: 'Team', id: string, name: string, description?: string | null, icon: string, startColor: string, endColor: string, archivedAt?: string | null, members: Array<{ __typename?: 'TeamMember', id: string, role: TeamMemberRole, person: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string } }> } | null } };

export type TeamOptionsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  input: TeamsQueryInput;
}>;


export type TeamOptionsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', teams: Array<{ __typename?: 'Team', id: string, name: string, icon: string }> } };

export type TeamPullRequestsInProgressQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
}>;


export type TeamPullRequestsInProgressQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', id: string, team?: { __typename?: 'Team', id: string, pullRequestsInProgress: { __typename?: 'PullRequestsInProgressResponse', drafted: Array<{ __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } }>, pendingReview: Array<{ __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } }>, changesRequested: Array<{ __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } }>, pendingMerge: Array<{ __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } }> } } | null } };

export type TeammatesQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  handle: Scalars['String']['input'];
}>;


export type TeammatesQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', person?: { __typename?: 'Person', id: string, teammates: Array<{ __typename?: 'TeamMember', id: string, person: { __typename?: 'Person', id: string } }> } | null } };

export type UpsertTeamMutationVariables = Exact<{
  input: UpsertTeamInput;
}>;


export type UpsertTeamMutation = { __typename?: 'Mutation', upsertTeam: { __typename?: 'Team', id: string, name: string, description?: string | null, icon: string, startColor: string, endColor: string, archivedAt?: string | null } };

export type ArchiveTeamMutationVariables = Exact<{
  input: ArchiveTeamInput;
}>;


export type ArchiveTeamMutation = { __typename?: 'Mutation', archiveTeam: { __typename?: 'Team', id: string, name: string, description?: string | null, icon: string, startColor: string, endColor: string, archivedAt?: string | null } };

export type UnarchiveTeamMutationVariables = Exact<{
  input: UnarchiveTeamInput;
}>;


export type UnarchiveTeamMutation = { __typename?: 'Mutation', unarchiveTeam: { __typename?: 'Team', id: string, name: string, description?: string | null, icon: string, startColor: string, endColor: string, archivedAt?: string | null } };

export type TeamWorkLogQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
  teamId: Scalars['SweetID']['input'];
  input: TeamWorkLogInput;
}>;


export type TeamWorkLogQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', team?: { __typename?: 'Team', members: Array<{ __typename?: 'TeamMember', id: string, role: TeamMemberRole, person: { __typename?: 'Person', id: string, name: string, handle: string, avatar?: string | null } }>, workLog: { __typename?: 'TeamWorkLogResponse', columns: Array<string>, data: Array<{ __typename: 'CodeReviewSubmittedEvent', eventAt: string, codeReview: { __typename?: 'CodeReview', id: string, state: CodeReviewState, commentCount: number, createdAt: string, author: { __typename?: 'Person', id: string, name: string, handle: string, avatar?: string | null }, pullRequest: { __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } } } } | { __typename: 'PullRequestCreatedEvent', eventAt: string, pullRequest: { __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } } } | { __typename: 'PullRequestMergedEvent', eventAt: string, pullRequest: { __typename?: 'PullRequest', id: string, title: string, gitUrl: string, commentCount: number, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, state: PullRequestState, createdAt: string, mergedAt?: string | null, closedAt?: string | null, tracking: { __typename?: 'PullRequestTracking', size: PullRequestSize, changedFilesCount: number, linesAddedCount: number, linesDeletedCount: number, timeToCode?: number | null, timeToFirstReview?: number | null, timeToFirstApproval?: number | null, timeToMerge?: number | null, timeToDeploy?: number | null, firstReviewAt?: string | null, firstApprovalAt?: string | null, firstDeployedAt?: string | null, cycleTime?: number | null }, author: { __typename?: 'Person', id: string, avatar?: string | null, handle: string, name: string }, repository: { __typename?: 'Repository', id: string, name: string, fullName: string } } }> } } | null } };

export type UserWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type UserWorkspacesQuery = { __typename?: 'Query', userWorkspaces: Array<{ __typename?: 'Workspace', id: string, name: string, avatar?: string | null, handle: string, gitUninstallUrl: string, isActiveCustomer: boolean, me?: { __typename?: 'Person', id: string, handle: string, name: string, avatar?: string | null, email?: string | null } | null, featureAdoption: { __typename?: 'WorkspaceFeatureAdoption', lastDeploymentCreatedAt?: string | null }, billing?: { __typename?: 'Billing', trial?: { __typename?: 'Trial', endAt: string } | null, subscription?: { __typename?: 'Subscription', isActive: boolean } | null } | null }> };

export type WorkspaceByInstallationIdQueryVariables = Exact<{
  gitInstallationId: Scalars['String']['input'];
}>;


export type WorkspaceByInstallationIdQuery = { __typename?: 'Query', workspaceByInstallationId?: { __typename?: 'Workspace', id: string, name: string, avatar?: string | null, handle: string, gitUninstallUrl: string, isActiveCustomer: boolean, repositories: Array<{ __typename?: 'Repository', id: string }> } | null };

export type WorkspaceSyncProgressQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type WorkspaceSyncProgressQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', initialSyncProgress: number } };

export type WorkspaceSettingsQueryVariables = Exact<{
  workspaceId: Scalars['SweetID']['input'];
}>;


export type WorkspaceSettingsQuery = { __typename?: 'Query', workspace: { __typename?: 'Workspace', id: string, settings: { __typename?: 'WorkspaceSettings', pullRequest: { __typename?: 'WorkspaceSettingsPullRequest', size: { __typename?: 'WorkspaceSettingsPullRequestSize', tiny: number, small: number, medium: number, large: number, ignorePatterns: Array<string> } } } } };

export type UpdateWorkspaceSettingsMutationVariables = Exact<{
  input: UpdateWorkspaceSettingsInput;
}>;


export type UpdateWorkspaceSettingsMutation = { __typename?: 'Mutation', updateWorkspaceSettings: { __typename?: 'Workspace', id: string, settings: { __typename?: 'WorkspaceSettings', pullRequest: { __typename?: 'WorkspaceSettingsPullRequest', size: { __typename?: 'WorkspaceSettingsPullRequestSize', tiny: number, small: number, medium: number, large: number } } } } };


export const TeamAlertsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamAlerts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamAlertsQuery, TeamAlertsQueryVariables>;
export const TeamAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlertQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamAlertQuery, TeamAlertQueryVariables>;
export const UpdateAlertDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAlert"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAlertInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]} as unknown as DocumentNode<UpdateAlertMutation, UpdateAlertMutationVariables>;
export const WorkspaceApiKeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceApiKey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastUsedAt"}},{"kind":"Field","name":{"kind":"Name","value":"creator"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceApiKeyQuery, WorkspaceApiKeyQueryVariables>;
export const RegenerateApiKeyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegenerateApiKey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegenerateApiKeyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"regenerateApiKey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RegenerateApiKeyMutation, RegenerateApiKeyMutationVariables>;
export const ApplicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Application"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"applicationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"application"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"applicationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"applicationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deploymentSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trigger"}},{"kind":"Field","name":{"kind":"Name","value":"subdirectory"}},{"kind":"Field","name":{"kind":"Name","value":"targetBranch"}}]}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ApplicationQuery, ApplicationQueryVariables>;
export const ApplicationOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApplicationOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ApplicationOptionsQuery, ApplicationOptionsQueryVariables>;
export const ApplicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Applications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lastProductionDeployment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]}}]} as unknown as DocumentNode<ApplicationsQuery, ApplicationsQueryVariables>;
export const UpsertApplicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertApplication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertApplicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpsertApplicationMutation, UpsertApplicationMutationVariables>;
export const ArchiveApplicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveApplication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchiveApplicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveApplicationMutation, ArchiveApplicationMutationVariables>;
export const UnarchiveApplicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnarchiveApplication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnarchiveApplicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unarchiveApplication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<UnarchiveApplicationMutation, UnarchiveApplicationMutationVariables>;
export const LoginWithGithubDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginWithGithub"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginWithGithubInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginWithGithub"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]}}]} as unknown as DocumentNode<LoginWithGithubMutation, LoginWithGithubMutationVariables>;
export const AuthProviderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthProvider"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AuthProviderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"authProvider"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"redirectUrl"}}]}}]}}]} as unknown as DocumentNode<AuthProviderQuery, AuthProviderQueryVariables>;
export const WorkspaceAutomationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceAutomation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AutomationQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"automation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceAutomationQuery, WorkspaceAutomationQueryVariables>;
export const WorkspaceAutomationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceAutomations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"automations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceAutomationsQuery, WorkspaceAutomationsQueryVariables>;
export const UpdateAutomationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAutomation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAutomationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAutomation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]} as unknown as DocumentNode<UpdateAutomationMutation, UpdateAutomationMutationVariables>;
export const BillingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Billing"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchasablePlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cloud"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthly"}},{"kind":"Field","name":{"kind":"Name","value":"yearly"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"estimatedSeats"}}]}}]}}]}}]} as unknown as DocumentNode<BillingQuery, BillingQueryVariables>;
export const LoginToStripeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginToStripe"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginToStripeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginToStripe"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<LoginToStripeMutation, LoginToStripeMutationVariables>;
export const PersonCodeReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PersonCodeReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CodeReviewsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pullRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PersonCodeReviewsQuery, PersonCodeReviewsQueryVariables>;
export const DeploymentOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DeploymentOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeploymentsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeploymentOptionsQuery, DeploymentOptionsQueryVariables>;
export const DeploymentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Deployments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeploymentsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"environment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isProduction"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"pullRequestCount"}}]}}]}}]}}]} as unknown as DocumentNode<DeploymentsQuery, DeploymentsQueryVariables>;
export const DeploymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Deployment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deploymentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deployment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"deploymentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deploymentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"environment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isProduction"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"pullRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DeploymentQuery, DeploymentQueryVariables>;
export const ArchiveDeploymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveDeployment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchiveDeploymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveDeployment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveDeploymentMutation, ArchiveDeploymentMutationVariables>;
export const UnarchiveDeploymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnarchiveDeployment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnarchiveDeploymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unarchiveDeployment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<UnarchiveDeploymentMutation, UnarchiveDeploymentMutationVariables>;
export const TeamDigestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamDigests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"digests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamDigestsQuery, TeamDigestsQueryVariables>;
export const TeamDigestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamDigest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DigestQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"digest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}},{"kind":"Field","name":{"kind":"Name","value":"channel"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfTheWeek"}},{"kind":"Field","name":{"kind":"Name","value":"timeOfDay"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamDigestQuery, TeamDigestQueryVariables>;
export const UpdateDigestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDigest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDigestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDigest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]} as unknown as DocumentNode<UpdateDigestMutation, UpdateDigestMutationVariables>;
export const DoraMetricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DoraMetrics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkspaceMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dora"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deploymentFrequency"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}},{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"avg"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"leadTime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}},{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"breakdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codingTime"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeToApprove"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"changeFailureRate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}},{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"meanTimeToRecover"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAmount"}},{"kind":"Field","name":{"kind":"Name","value":"previousAmount"}},{"kind":"Field","name":{"kind":"Name","value":"change"}},{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousPeriod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<DoraMetricsQuery, DoraMetricsQueryVariables>;
export const EnvironmentOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EnvironmentOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnvironmentsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"environments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isProduction"}}]}}]}}]}}]} as unknown as DocumentNode<EnvironmentOptionsQuery, EnvironmentOptionsQueryVariables>;
export const EnvironmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Environments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnvironmentsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"environments"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isProduction"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]}}]} as unknown as DocumentNode<EnvironmentsQuery, EnvironmentsQueryVariables>;
export const ArchiveEnvironmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveEnvironment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchiveEnvironmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveEnvironment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isProduction"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveEnvironmentMutation, ArchiveEnvironmentMutationVariables>;
export const UnarchiveEnvironmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnarchiveEnvironment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnarchiveEnvironmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unarchiveEnvironment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isProduction"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<UnarchiveEnvironmentMutation, UnarchiveEnvironmentMutationVariables>;
export const IncidentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Incidents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"IncidentsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"incidents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"detectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"postmortemUrl"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"causeDeployment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"fixDeployment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<IncidentsQuery, IncidentsQueryVariables>;
export const IncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Incident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"incidentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"incident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"incidentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"incidentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"detectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"postmortemUrl"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"causeDeployment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"fixDeployment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"application"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<IncidentQuery, IncidentQueryVariables>;
export const UpsertIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertIncidentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<UpsertIncidentMutation, UpsertIncidentMutationVariables>;
export const ArchiveIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchiveIncidentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"detectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveIncidentMutation, ArchiveIncidentMutationVariables>;
export const UnarchiveIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnarchiveIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnarchiveIncidentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unarchiveIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"detectedAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<UnarchiveIncidentMutation, UnarchiveIncidentMutationVariables>;
export const WorkspaceIntegrationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceIntegrations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"integrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"app"}},{"kind":"Field","name":{"kind":"Name","value":"isEnabled"}},{"kind":"Field","name":{"kind":"Name","value":"installUrl"}},{"kind":"Field","name":{"kind":"Name","value":"enabledAt"}},{"kind":"Field","name":{"kind":"Name","value":"target"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceIntegrationsQuery, WorkspaceIntegrationsQueryVariables>;
export const InstallIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InstallIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<InstallIntegrationMutation, InstallIntegrationMutationVariables>;
export const RemoveIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveIntegrationMutation, RemoveIntegrationMutationVariables>;
export const SendTestMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendTestMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendTestMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendTestMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SendTestMessageMutation, SendTestMessageMutationVariables>;
export const PeopleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"People"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PeopleQueryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"people"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]}}]} as unknown as DocumentNode<PeopleQuery, PeopleQueryVariables>;
export const PersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Person"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"teamMemberships"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PersonQuery, PersonQueryVariables>;
export const PersonalMetricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PersonalMetrics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personalMetrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pullRequestSize"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"previous"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}},{"kind":"Field","name":{"kind":"Name","value":"codeReviewAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"previous"}},{"kind":"Field","name":{"kind":"Name","value":"change"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PersonalMetricsQuery, PersonalMetricsQueryVariables>;
export const ChartTimeToMergeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChartTimeToMerge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChartTimeToMergeQuery, ChartTimeToMergeQueryVariables>;
export const ChartTimeToFirstReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChartTimeToFirstReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timeForFirstReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChartTimeToFirstReviewQuery, ChartTimeToFirstReviewQueryVariables>;
export const ChartTimeToApprovalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChartTimeToApproval"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timeForApproval"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChartTimeToApprovalQuery, ChartTimeToApprovalQueryVariables>;
export const ChartCycleTimeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChartCycleTime"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cycleTime"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChartCycleTimeQuery, ChartCycleTimeQueryVariables>;
export const PullRequestSizeDistributionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PullRequestSizeDistribution"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pullRequestSizeDistribution"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"series"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PullRequestSizeDistributionQuery, PullRequestSizeDistributionQueryVariables>;
export const ChartCodeReviewDistributionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChartCodeReviewDistribution"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamMetricInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"codeReviewDistribution"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"entities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"reviewSharePercentage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"links"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"target"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalReviews"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChartCodeReviewDistributionQuery, ChartCodeReviewDistributionQueryVariables>;
export const PullRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PullRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequestsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pullRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PullRequestsQuery, PullRequestsQueryVariables>;
export const RepositoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Repositories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"RepositoriesQueryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repositories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]} as unknown as DocumentNode<RepositoriesQuery, RepositoriesQueryVariables>;
export const SpotlightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Spotlight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"peopleInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PeopleQueryInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamsInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamsQueryInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoriesInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RepositoriesQueryInput"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"applicationsInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ApplicationsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"people"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"peopleInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repositories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoriesInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"applications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"applicationsInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<SpotlightQuery, SpotlightQueryVariables>;
export const WorkspaceLastSyncBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceLastSyncBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastSyncBatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"finishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"sinceDaysAgo"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceLastSyncBatchQuery, WorkspaceLastSyncBatchQueryVariables>;
export const ScheduleSyncBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ScheduleSyncBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleSyncBatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleSyncBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"finishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"sinceDaysAgo"}}]}}]}}]} as unknown as DocumentNode<ScheduleSyncBatchMutation, ScheduleSyncBatchMutationVariables>;
export const TeamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Teams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamsQueryInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamsQuery, TeamsQueryVariables>;
export const TeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Team"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamQuery, TeamQueryVariables>;
export const TeamOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamsQueryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"teams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}}]}}]}}]}}]} as unknown as DocumentNode<TeamOptionsQuery, TeamOptionsQueryVariables>;
export const TeamPullRequestsInProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamPullRequestsInProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pullRequestsInProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"drafted"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingReview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"changesRequested"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingMerge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamPullRequestsInProgressQuery, TeamPullRequestsInProgressQueryVariables>;
export const TeammatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Teammates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"teammates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeammatesQuery, TeammatesQueryVariables>;
export const UpsertTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpsertTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<UpsertTeamMutation, UpsertTeamMutationVariables>;
export const ArchiveTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchiveTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<ArchiveTeamMutation, ArchiveTeamMutationVariables>;
export const UnarchiveTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnarchiveTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnarchiveTeamInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unarchiveTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"startColor"}},{"kind":"Field","name":{"kind":"Name","value":"endColor"}},{"kind":"Field","name":{"kind":"Name","value":"archivedAt"}}]}}]}}]} as unknown as DocumentNode<UnarchiveTeamMutation, UnarchiveTeamMutationVariables>;
export const TeamWorkLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamWorkLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TeamWorkLogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"workLog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CodeReviewSubmittedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventAt"}},{"kind":"Field","name":{"kind":"Name","value":"codeReview"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pullRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequestCreatedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventAt"}},{"kind":"Field","name":{"kind":"Name","value":"pullRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PullRequestMergedEvent"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventAt"}},{"kind":"Field","name":{"kind":"Name","value":"pullRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gitUrl"}},{"kind":"Field","name":{"kind":"Name","value":"commentCount"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"mergedAt"}},{"kind":"Field","name":{"kind":"Name","value":"closedAt"}},{"kind":"Field","name":{"kind":"Name","value":"tracking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"changedFilesCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesAddedCount"}},{"kind":"Field","name":{"kind":"Name","value":"linesDeletedCount"}},{"kind":"Field","name":{"kind":"Name","value":"timeToCode"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstReview"}},{"kind":"Field","name":{"kind":"Name","value":"timeToFirstApproval"}},{"kind":"Field","name":{"kind":"Name","value":"timeToMerge"}},{"kind":"Field","name":{"kind":"Name","value":"timeToDeploy"}},{"kind":"Field","name":{"kind":"Name","value":"firstReviewAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstApprovalAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstDeployedAt"}},{"kind":"Field","name":{"kind":"Name","value":"cycleTime"}}]}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamWorkLogQuery, TeamWorkLogQueryVariables>;
export const UserWorkspacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"gitUninstallUrl"}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featureAdoption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lastDeploymentCreatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billing"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trial"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"isActiveCustomer"}}]}}]}}]} as unknown as DocumentNode<UserWorkspacesQuery, UserWorkspacesQueryVariables>;
export const WorkspaceByInstallationIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceByInstallationId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gitInstallationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspaceByInstallationId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gitInstallationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gitInstallationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"gitUninstallUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isActiveCustomer"}},{"kind":"Field","name":{"kind":"Name","value":"repositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceByInstallationIdQuery, WorkspaceByInstallationIdQueryVariables>;
export const WorkspaceSyncProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceSyncProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"initialSyncProgress"}}]}}]}}]} as unknown as DocumentNode<WorkspaceSyncProgressQuery, WorkspaceSyncProgressQueryVariables>;
export const WorkspaceSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkspaceSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SweetID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workspace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pullRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tiny"}},{"kind":"Field","name":{"kind":"Name","value":"small"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"large"}},{"kind":"Field","name":{"kind":"Name","value":"ignorePatterns"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<WorkspaceSettingsQuery, WorkspaceSettingsQueryVariables>;
export const UpdateWorkspaceSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkspaceSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWorkspaceSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkspaceSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"settings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pullRequest"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"size"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tiny"}},{"kind":"Field","name":{"kind":"Name","value":"small"}},{"kind":"Field","name":{"kind":"Name","value":"medium"}},{"kind":"Field","name":{"kind":"Name","value":"large"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateWorkspaceSettingsMutation, UpdateWorkspaceSettingsMutationVariables>;