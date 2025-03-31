import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQLContext } from './shared';
import { DeepPartial } from 'utility-types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: bigint; output: bigint; }
  DateTime: { input: string; output: string; }
  HexColorCode: { input: string; output: string; }
  JSONObject: { input: object; output: object; }
  SweetID: { input: number; output: number; }
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

export type ChartInput = {
  /** The date range. */
  dateRange: DateTimeRange;
  /** The period to group by. */
  period: Period;
  /** The team id to filter by. */
  teamId: Scalars['SweetID']['input'];
};

export type ChartNumericSeries = {
  __typename?: 'ChartNumericSeries';
  color?: Maybe<Scalars['HexColorCode']['output']>;
  data: Array<Scalars['BigInt']['output']>;
  name: Scalars['String']['output'];
};

export type Charts = {
  __typename?: 'Charts';
  codeReviewDistribution?: Maybe<CodeReviewDistributionChartData>;
  cycleTime?: Maybe<NumericChartData>;
  pullRequestSizeDistribution?: Maybe<NumericSeriesChartData>;
  timeForApproval?: Maybe<NumericChartData>;
  timeForFirstReview?: Maybe<NumericChartData>;
  timeToMerge?: Maybe<NumericChartData>;
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

export enum DayOfTheWeek {
  FRIDAY = 'FRIDAY',
  MONDAY = 'MONDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  THURSDAY = 'THURSDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY'
}

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

export type GraphChartLink = {
  __typename?: 'GraphChartLink';
  source: Scalars['String']['output'];
  target: Scalars['String']['output'];
  value: Scalars['Int']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  archiveTeam: Team;
  installIntegration?: Maybe<Scalars['Void']['output']>;
  loginToStripe?: Maybe<Scalars['String']['output']>;
  loginWithGithub: LoginWithGithubResponse;
  regenerateApiKey: Scalars['String']['output'];
  removeIntegration?: Maybe<Scalars['Void']['output']>;
  sendTestMessage?: Maybe<Scalars['Void']['output']>;
  unarchiveTeam: Team;
  updateAlert: Alert;
  updateAutomation: Automation;
  updateDigest: Digest;
  updateWorkspaceSettings: Workspace;
  upsertTeam: Team;
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


export type MutationSendTestMessageArgs = {
  input: SendTestMessageInput;
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
  /** The time when the pull request received its first approval */
  firstApprovalAt?: Maybe<Scalars['DateTime']['output']>;
  /** The time when the pull request received its first review */
  firstReviewAt?: Maybe<Scalars['DateTime']['output']>;
  /** The amount of lines added (ignores auto-generated files) */
  linesAddedCount: Scalars['Int']['output'];
  /** The amount of lines deleted (ignores auto-generated files) */
  linesDeletedCount: Scalars['Int']['output'];
  /** The size of the pull request */
  size: PullRequestSize;
  /** The duration, in milliseconds, between the time the first reviewer was requested and the time it received its first approval */
  timeToFirstApproval?: Maybe<Scalars['BigInt']['output']>;
  /** The duration, in milliseconds, between the time the first reviewer was requested and the time it received its first review */
  timeToFirstReview?: Maybe<Scalars['BigInt']['output']>;
  /** The duration, in milliseconds, between the first approval of the Pull Request and the time it received it was merged. Compares with creation date when merged without reviews */
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
  /** The time range the pull request was created in */
  createdAt?: InputMaybe<DateTimeRange>;
  /** The pagination cursor */
  cursor?: InputMaybe<Scalars['SweetID']['input']>;
  /** The time range the pull request was merged or closed */
  finalizedAt?: InputMaybe<DateTimeRange>;
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

export type SendTestMessageInput = {
  app: IntegrationApp;
  channel: Scalars['String']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  isActive: Scalars['Boolean']['output'];
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
  automation?: Maybe<Automation>;
  automations: Array<Automation>;
  avatar?: Maybe<Scalars['String']['output']>;
  billing?: Maybe<Billing>;
  charts?: Maybe<Charts>;
  /** The git provider URL to uninstall the sweetr app */
  gitUninstallUrl: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  /** A number between 0 and 100 representing the progress of the initial data synchronization with the git provider */
  initialSyncProgress: Scalars['Int']['output'];
  integrations: Array<Integration>;
  /** Whether the workspace should have access to the dashboard */
  isActiveCustomer: Scalars['Boolean']['output'];
  me?: Maybe<Person>;
  name: Scalars['String']['output'];
  people: Array<Person>;
  person?: Maybe<Person>;
  pullRequests: Array<PullRequest>;
  repositories: Array<Repository>;
  settings: WorkspaceSettings;
  team?: Maybe<Team>;
  teams: Array<Team>;
};


export type WorkspaceAutomationArgs = {
  input: AutomationQueryInput;
};


export type WorkspaceChartsArgs = {
  input: ChartInput;
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<RefType extends Record<string, unknown>> = {
  ActivityEvent: ( DeepPartial<CodeReviewSubmittedEvent> ) | ( DeepPartial<PullRequestCreatedEvent> ) | ( DeepPartial<PullRequestMergedEvent> );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActivityEvent: DeepPartial<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ActivityEvent']>>;
  ActivityEventType: ResolverTypeWrapper<DeepPartial<ActivityEventType>>;
  Alert: ResolverTypeWrapper<DeepPartial<Alert>>;
  AlertQueryInput: ResolverTypeWrapper<DeepPartial<AlertQueryInput>>;
  AlertType: ResolverTypeWrapper<DeepPartial<AlertType>>;
  ApiKey: ResolverTypeWrapper<DeepPartial<ApiKey>>;
  ArchiveTeamInput: ResolverTypeWrapper<DeepPartial<ArchiveTeamInput>>;
  AuthProvider: ResolverTypeWrapper<DeepPartial<AuthProvider>>;
  AuthProviderInput: ResolverTypeWrapper<DeepPartial<AuthProviderInput>>;
  AuthProviderResponse: ResolverTypeWrapper<DeepPartial<AuthProviderResponse>>;
  Automation: ResolverTypeWrapper<DeepPartial<Automation>>;
  AutomationBenefits: ResolverTypeWrapper<DeepPartial<AutomationBenefits>>;
  AutomationQueryInput: ResolverTypeWrapper<DeepPartial<AutomationQueryInput>>;
  AutomationType: ResolverTypeWrapper<DeepPartial<AutomationType>>;
  BigInt: ResolverTypeWrapper<DeepPartial<Scalars['BigInt']['output']>>;
  Billing: ResolverTypeWrapper<DeepPartial<Billing>>;
  Boolean: ResolverTypeWrapper<DeepPartial<Scalars['Boolean']['output']>>;
  ChartInput: ResolverTypeWrapper<DeepPartial<ChartInput>>;
  ChartNumericSeries: ResolverTypeWrapper<DeepPartial<ChartNumericSeries>>;
  Charts: ResolverTypeWrapper<DeepPartial<Charts>>;
  CodeReview: ResolverTypeWrapper<DeepPartial<CodeReview>>;
  CodeReviewDistributionChartData: ResolverTypeWrapper<DeepPartial<CodeReviewDistributionChartData>>;
  CodeReviewDistributionEntity: ResolverTypeWrapper<DeepPartial<CodeReviewDistributionEntity>>;
  CodeReviewState: ResolverTypeWrapper<DeepPartial<CodeReviewState>>;
  CodeReviewSubmittedEvent: ResolverTypeWrapper<DeepPartial<CodeReviewSubmittedEvent>>;
  CodeReviewsInput: ResolverTypeWrapper<DeepPartial<CodeReviewsInput>>;
  DateTime: ResolverTypeWrapper<DeepPartial<Scalars['DateTime']['output']>>;
  DateTimeRange: ResolverTypeWrapper<DeepPartial<DateTimeRange>>;
  DayOfTheWeek: ResolverTypeWrapper<DeepPartial<DayOfTheWeek>>;
  Digest: ResolverTypeWrapper<DeepPartial<Digest>>;
  DigestFrequency: ResolverTypeWrapper<DeepPartial<DigestFrequency>>;
  DigestQueryInput: ResolverTypeWrapper<DeepPartial<DigestQueryInput>>;
  DigestType: ResolverTypeWrapper<DeepPartial<DigestType>>;
  Float: ResolverTypeWrapper<DeepPartial<Scalars['Float']['output']>>;
  GraphChartLink: ResolverTypeWrapper<DeepPartial<GraphChartLink>>;
  HexColorCode: ResolverTypeWrapper<DeepPartial<Scalars['HexColorCode']['output']>>;
  InstallIntegrationInput: ResolverTypeWrapper<DeepPartial<InstallIntegrationInput>>;
  Int: ResolverTypeWrapper<DeepPartial<Scalars['Int']['output']>>;
  Integration: ResolverTypeWrapper<DeepPartial<Integration>>;
  IntegrationApp: ResolverTypeWrapper<DeepPartial<IntegrationApp>>;
  JSONObject: ResolverTypeWrapper<DeepPartial<Scalars['JSONObject']['output']>>;
  LoginToStripeInput: ResolverTypeWrapper<DeepPartial<LoginToStripeInput>>;
  LoginWithGithubInput: ResolverTypeWrapper<DeepPartial<LoginWithGithubInput>>;
  LoginWithGithubResponse: ResolverTypeWrapper<DeepPartial<LoginWithGithubResponse>>;
  Mutation: ResolverTypeWrapper<{}>;
  NumericChartData: ResolverTypeWrapper<DeepPartial<NumericChartData>>;
  NumericPersonalMetric: ResolverTypeWrapper<DeepPartial<NumericPersonalMetric>>;
  NumericSeriesChartData: ResolverTypeWrapper<DeepPartial<NumericSeriesChartData>>;
  PeopleQueryInput: ResolverTypeWrapper<DeepPartial<PeopleQueryInput>>;
  Period: ResolverTypeWrapper<DeepPartial<Period>>;
  Person: ResolverTypeWrapper<DeepPartial<Person>>;
  PersonalMetrics: ResolverTypeWrapper<DeepPartial<PersonalMetrics>>;
  PlanKeys: ResolverTypeWrapper<DeepPartial<PlanKeys>>;
  PullRequest: ResolverTypeWrapper<DeepPartial<PullRequest>>;
  PullRequestCreatedEvent: ResolverTypeWrapper<DeepPartial<PullRequestCreatedEvent>>;
  PullRequestMergedEvent: ResolverTypeWrapper<DeepPartial<PullRequestMergedEvent>>;
  PullRequestOwnerType: ResolverTypeWrapper<DeepPartial<PullRequestOwnerType>>;
  PullRequestSize: ResolverTypeWrapper<DeepPartial<PullRequestSize>>;
  PullRequestState: ResolverTypeWrapper<DeepPartial<PullRequestState>>;
  PullRequestTracking: ResolverTypeWrapper<DeepPartial<PullRequestTracking>>;
  PullRequestTrendInput: ResolverTypeWrapper<DeepPartial<PullRequestTrendInput>>;
  PullRequestsInProgressResponse: ResolverTypeWrapper<DeepPartial<PullRequestsInProgressResponse>>;
  PullRequestsQueryInput: ResolverTypeWrapper<DeepPartial<PullRequestsQueryInput>>;
  PurchasablePlans: ResolverTypeWrapper<DeepPartial<PurchasablePlans>>;
  Query: ResolverTypeWrapper<{}>;
  RegenerateApiKeyInput: ResolverTypeWrapper<DeepPartial<RegenerateApiKeyInput>>;
  RemoveIntegrationInput: ResolverTypeWrapper<DeepPartial<RemoveIntegrationInput>>;
  RepositoriesQueryInput: ResolverTypeWrapper<DeepPartial<RepositoriesQueryInput>>;
  Repository: ResolverTypeWrapper<DeepPartial<Repository>>;
  SendTestMessageInput: ResolverTypeWrapper<DeepPartial<SendTestMessageInput>>;
  String: ResolverTypeWrapper<DeepPartial<Scalars['String']['output']>>;
  Subscription: ResolverTypeWrapper<{}>;
  SweetID: ResolverTypeWrapper<DeepPartial<Scalars['SweetID']['output']>>;
  Team: ResolverTypeWrapper<DeepPartial<Team>>;
  TeamMember: ResolverTypeWrapper<DeepPartial<TeamMember>>;
  TeamMemberRole: ResolverTypeWrapper<DeepPartial<TeamMemberRole>>;
  TeamWorkLogInput: ResolverTypeWrapper<DeepPartial<TeamWorkLogInput>>;
  TeamWorkLogResponse: ResolverTypeWrapper<DeepPartial<Omit<TeamWorkLogResponse, 'data'> & { data: Array<ResolversTypes['ActivityEvent']> }>>;
  TeamsQueryInput: ResolverTypeWrapper<DeepPartial<TeamsQueryInput>>;
  TimeZone: ResolverTypeWrapper<DeepPartial<Scalars['TimeZone']['output']>>;
  Token: ResolverTypeWrapper<DeepPartial<Token>>;
  Trial: ResolverTypeWrapper<DeepPartial<Trial>>;
  UnarchiveTeamInput: ResolverTypeWrapper<DeepPartial<UnarchiveTeamInput>>;
  UpdateAlertInput: ResolverTypeWrapper<DeepPartial<UpdateAlertInput>>;
  UpdateAutomationInput: ResolverTypeWrapper<DeepPartial<UpdateAutomationInput>>;
  UpdateDigestInput: ResolverTypeWrapper<DeepPartial<UpdateDigestInput>>;
  UpdateWorkspaceSettingsInput: ResolverTypeWrapper<DeepPartial<UpdateWorkspaceSettingsInput>>;
  UpsertTeamInput: ResolverTypeWrapper<DeepPartial<UpsertTeamInput>>;
  UpsertTeamMemberInput: ResolverTypeWrapper<DeepPartial<UpsertTeamMemberInput>>;
  Void: ResolverTypeWrapper<DeepPartial<Scalars['Void']['output']>>;
  Workspace: ResolverTypeWrapper<DeepPartial<Workspace>>;
  WorkspaceSettings: ResolverTypeWrapper<DeepPartial<WorkspaceSettings>>;
  WorkspaceSettingsInput: ResolverTypeWrapper<DeepPartial<WorkspaceSettingsInput>>;
  WorkspaceSettingsPullRequest: ResolverTypeWrapper<DeepPartial<WorkspaceSettingsPullRequest>>;
  WorkspaceSettingsPullRequestInput: ResolverTypeWrapper<DeepPartial<WorkspaceSettingsPullRequestInput>>;
  WorkspaceSettingsPullRequestSize: ResolverTypeWrapper<DeepPartial<WorkspaceSettingsPullRequestSize>>;
  WorkspaceSettingsPullRequestSizeInput: ResolverTypeWrapper<DeepPartial<WorkspaceSettingsPullRequestSizeInput>>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActivityEvent: DeepPartial<ResolversUnionTypes<ResolversParentTypes>['ActivityEvent']>;
  Alert: DeepPartial<Alert>;
  AlertQueryInput: DeepPartial<AlertQueryInput>;
  ApiKey: DeepPartial<ApiKey>;
  ArchiveTeamInput: DeepPartial<ArchiveTeamInput>;
  AuthProviderInput: DeepPartial<AuthProviderInput>;
  AuthProviderResponse: DeepPartial<AuthProviderResponse>;
  Automation: DeepPartial<Automation>;
  AutomationBenefits: DeepPartial<AutomationBenefits>;
  AutomationQueryInput: DeepPartial<AutomationQueryInput>;
  BigInt: DeepPartial<Scalars['BigInt']['output']>;
  Billing: DeepPartial<Billing>;
  Boolean: DeepPartial<Scalars['Boolean']['output']>;
  ChartInput: DeepPartial<ChartInput>;
  ChartNumericSeries: DeepPartial<ChartNumericSeries>;
  Charts: DeepPartial<Charts>;
  CodeReview: DeepPartial<CodeReview>;
  CodeReviewDistributionChartData: DeepPartial<CodeReviewDistributionChartData>;
  CodeReviewDistributionEntity: DeepPartial<CodeReviewDistributionEntity>;
  CodeReviewSubmittedEvent: DeepPartial<CodeReviewSubmittedEvent>;
  CodeReviewsInput: DeepPartial<CodeReviewsInput>;
  DateTime: DeepPartial<Scalars['DateTime']['output']>;
  DateTimeRange: DeepPartial<DateTimeRange>;
  Digest: DeepPartial<Digest>;
  DigestQueryInput: DeepPartial<DigestQueryInput>;
  Float: DeepPartial<Scalars['Float']['output']>;
  GraphChartLink: DeepPartial<GraphChartLink>;
  HexColorCode: DeepPartial<Scalars['HexColorCode']['output']>;
  InstallIntegrationInput: DeepPartial<InstallIntegrationInput>;
  Int: DeepPartial<Scalars['Int']['output']>;
  Integration: DeepPartial<Integration>;
  JSONObject: DeepPartial<Scalars['JSONObject']['output']>;
  LoginToStripeInput: DeepPartial<LoginToStripeInput>;
  LoginWithGithubInput: DeepPartial<LoginWithGithubInput>;
  LoginWithGithubResponse: DeepPartial<LoginWithGithubResponse>;
  Mutation: {};
  NumericChartData: DeepPartial<NumericChartData>;
  NumericPersonalMetric: DeepPartial<NumericPersonalMetric>;
  NumericSeriesChartData: DeepPartial<NumericSeriesChartData>;
  PeopleQueryInput: DeepPartial<PeopleQueryInput>;
  Person: DeepPartial<Person>;
  PersonalMetrics: DeepPartial<PersonalMetrics>;
  PlanKeys: DeepPartial<PlanKeys>;
  PullRequest: DeepPartial<PullRequest>;
  PullRequestCreatedEvent: DeepPartial<PullRequestCreatedEvent>;
  PullRequestMergedEvent: DeepPartial<PullRequestMergedEvent>;
  PullRequestTracking: DeepPartial<PullRequestTracking>;
  PullRequestTrendInput: DeepPartial<PullRequestTrendInput>;
  PullRequestsInProgressResponse: DeepPartial<PullRequestsInProgressResponse>;
  PullRequestsQueryInput: DeepPartial<PullRequestsQueryInput>;
  PurchasablePlans: DeepPartial<PurchasablePlans>;
  Query: {};
  RegenerateApiKeyInput: DeepPartial<RegenerateApiKeyInput>;
  RemoveIntegrationInput: DeepPartial<RemoveIntegrationInput>;
  RepositoriesQueryInput: DeepPartial<RepositoriesQueryInput>;
  Repository: DeepPartial<Repository>;
  SendTestMessageInput: DeepPartial<SendTestMessageInput>;
  String: DeepPartial<Scalars['String']['output']>;
  Subscription: {};
  SweetID: DeepPartial<Scalars['SweetID']['output']>;
  Team: DeepPartial<Team>;
  TeamMember: DeepPartial<TeamMember>;
  TeamWorkLogInput: DeepPartial<TeamWorkLogInput>;
  TeamWorkLogResponse: DeepPartial<Omit<TeamWorkLogResponse, 'data'> & { data: Array<ResolversParentTypes['ActivityEvent']> }>;
  TeamsQueryInput: DeepPartial<TeamsQueryInput>;
  TimeZone: DeepPartial<Scalars['TimeZone']['output']>;
  Token: DeepPartial<Token>;
  Trial: DeepPartial<Trial>;
  UnarchiveTeamInput: DeepPartial<UnarchiveTeamInput>;
  UpdateAlertInput: DeepPartial<UpdateAlertInput>;
  UpdateAutomationInput: DeepPartial<UpdateAutomationInput>;
  UpdateDigestInput: DeepPartial<UpdateDigestInput>;
  UpdateWorkspaceSettingsInput: DeepPartial<UpdateWorkspaceSettingsInput>;
  UpsertTeamInput: DeepPartial<UpsertTeamInput>;
  UpsertTeamMemberInput: DeepPartial<UpsertTeamMemberInput>;
  Void: DeepPartial<Scalars['Void']['output']>;
  Workspace: DeepPartial<Workspace>;
  WorkspaceSettings: DeepPartial<WorkspaceSettings>;
  WorkspaceSettingsInput: DeepPartial<WorkspaceSettingsInput>;
  WorkspaceSettingsPullRequest: DeepPartial<WorkspaceSettingsPullRequest>;
  WorkspaceSettingsPullRequestInput: DeepPartial<WorkspaceSettingsPullRequestInput>;
  WorkspaceSettingsPullRequestSize: DeepPartial<WorkspaceSettingsPullRequestSize>;
  WorkspaceSettingsPullRequestSizeInput: DeepPartial<WorkspaceSettingsPullRequestSizeInput>;
};

export type RateLimitDirectiveArgs = {
  arrayLengthField?: Maybe<Scalars['String']['input']>;
  identityArgs?: Maybe<Array<Maybe<Scalars['String']['input']>>>;
  max?: Maybe<Scalars['Int']['input']>;
  message?: Maybe<Scalars['String']['input']>;
  window?: Maybe<Scalars['String']['input']>;
};

export type RateLimitDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = RateLimitDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SkipAuthDirectiveArgs = { };

export type SkipAuthDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = SkipAuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ActivityEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ActivityEvent'] = ResolversParentTypes['ActivityEvent']> = {
  __resolveType: TypeResolveFn<'CodeReviewSubmittedEvent' | 'PullRequestCreatedEvent' | 'PullRequestMergedEvent', ParentType, ContextType>;
};

export type AlertResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Alert'] = ResolversParentTypes['Alert']> = {
  channel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AlertType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ApiKeyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ApiKey'] = ResolversParentTypes['ApiKey']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  creator?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  lastUsedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthProviderResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthProviderResponse'] = ResolversParentTypes['AuthProviderResponse']> = {
  redirectUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AutomationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Automation'] = ResolversParentTypes['Automation']> = {
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  settings?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AutomationType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AutomationBenefitsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AutomationBenefits'] = ResolversParentTypes['AutomationBenefits']> = {
  compliance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cycleTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  failureRate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  security?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  techDebt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export type BillingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Billing'] = ResolversParentTypes['Billing']> = {
  estimatedSeats?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  purchasablePlans?: Resolver<Maybe<ResolversTypes['PurchasablePlans']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['Subscription']>, ParentType, ContextType>;
  trial?: Resolver<Maybe<ResolversTypes['Trial']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChartNumericSeriesResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ChartNumericSeries'] = ResolversParentTypes['ChartNumericSeries']> = {
  color?: Resolver<Maybe<ResolversTypes['HexColorCode']>, ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['BigInt']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChartsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Charts'] = ResolversParentTypes['Charts']> = {
  codeReviewDistribution?: Resolver<Maybe<ResolversTypes['CodeReviewDistributionChartData']>, ParentType, ContextType>;
  cycleTime?: Resolver<Maybe<ResolversTypes['NumericChartData']>, ParentType, ContextType>;
  pullRequestSizeDistribution?: Resolver<Maybe<ResolversTypes['NumericSeriesChartData']>, ParentType, ContextType>;
  timeForApproval?: Resolver<Maybe<ResolversTypes['NumericChartData']>, ParentType, ContextType>;
  timeForFirstReview?: Resolver<Maybe<ResolversTypes['NumericChartData']>, ParentType, ContextType>;
  timeToMerge?: Resolver<Maybe<ResolversTypes['NumericChartData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CodeReviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CodeReview'] = ResolversParentTypes['CodeReview']> = {
  author?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  pullRequest?: Resolver<ResolversTypes['PullRequest'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['CodeReviewState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CodeReviewDistributionChartDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CodeReviewDistributionChartData'] = ResolversParentTypes['CodeReviewDistributionChartData']> = {
  entities?: Resolver<Array<ResolversTypes['CodeReviewDistributionEntity']>, ParentType, ContextType>;
  links?: Resolver<Array<ResolversTypes['GraphChartLink']>, ParentType, ContextType>;
  totalReviews?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CodeReviewDistributionEntityResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CodeReviewDistributionEntity'] = ResolversParentTypes['CodeReviewDistributionEntity']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reviewCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  reviewSharePercentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CodeReviewSubmittedEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CodeReviewSubmittedEvent'] = ResolversParentTypes['CodeReviewSubmittedEvent']> = {
  codeReview?: Resolver<ResolversTypes['CodeReview'], ParentType, ContextType>;
  eventAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DigestResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Digest'] = ResolversParentTypes['Digest']> = {
  channel?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dayOfTheWeek?: Resolver<Array<ResolversTypes['DayOfTheWeek']>, ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  frequency?: Resolver<ResolversTypes['DigestFrequency'], ParentType, ContextType>;
  settings?: Resolver<ResolversTypes['JSONObject'], ParentType, ContextType>;
  timeOfDay?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['TimeZone'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['DigestType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GraphChartLinkResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GraphChartLink'] = ResolversParentTypes['GraphChartLink']> = {
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface HexColorCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HexColorCode'], any> {
  name: 'HexColorCode';
}

export type IntegrationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Integration'] = ResolversParentTypes['Integration']> = {
  app?: Resolver<ResolversTypes['IntegrationApp'], ParentType, ContextType>;
  enabledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  installUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  target?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type LoginWithGithubResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LoginWithGithubResponse'] = ResolversParentTypes['LoginWithGithubResponse']> = {
  redirectTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  archiveTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationArchiveTeamArgs, 'input'>>;
  installIntegration?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationInstallIntegrationArgs, 'input'>>;
  loginToStripe?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationLoginToStripeArgs, 'input'>>;
  loginWithGithub?: Resolver<ResolversTypes['LoginWithGithubResponse'], ParentType, ContextType, RequireFields<MutationLoginWithGithubArgs, 'input'>>;
  regenerateApiKey?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationRegenerateApiKeyArgs, 'input'>>;
  removeIntegration?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationRemoveIntegrationArgs, 'input'>>;
  sendTestMessage?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationSendTestMessageArgs, 'input'>>;
  unarchiveTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationUnarchiveTeamArgs, 'input'>>;
  updateAlert?: Resolver<ResolversTypes['Alert'], ParentType, ContextType, RequireFields<MutationUpdateAlertArgs, 'input'>>;
  updateAutomation?: Resolver<ResolversTypes['Automation'], ParentType, ContextType, RequireFields<MutationUpdateAutomationArgs, 'input'>>;
  updateDigest?: Resolver<ResolversTypes['Digest'], ParentType, ContextType, RequireFields<MutationUpdateDigestArgs, 'input'>>;
  updateWorkspaceSettings?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<MutationUpdateWorkspaceSettingsArgs, 'input'>>;
  upsertTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationUpsertTeamArgs, 'input'>>;
};

export type NumericChartDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NumericChartData'] = ResolversParentTypes['NumericChartData']> = {
  columns?: Resolver<Array<ResolversTypes['DateTime']>, ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NumericPersonalMetricResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NumericPersonalMetric'] = ResolversParentTypes['NumericPersonalMetric']> = {
  change?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  current?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  previous?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NumericSeriesChartDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['NumericSeriesChartData'] = ResolversParentTypes['NumericSeriesChartData']> = {
  columns?: Resolver<Array<ResolversTypes['DateTime']>, ParentType, ContextType>;
  series?: Resolver<Array<ResolversTypes['ChartNumericSeries']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person']> = {
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  codeReviews?: Resolver<Array<ResolversTypes['CodeReview']>, ParentType, ContextType, Partial<PersonCodeReviewsArgs>>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  personalMetrics?: Resolver<ResolversTypes['PersonalMetrics'], ParentType, ContextType>;
  teamMemberships?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType>;
  teammates?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonalMetricsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PersonalMetrics'] = ResolversParentTypes['PersonalMetrics']> = {
  codeReviewAmount?: Resolver<ResolversTypes['NumericPersonalMetric'], ParentType, ContextType>;
  pullRequestSize?: Resolver<ResolversTypes['NumericPersonalMetric'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanKeysResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PlanKeys'] = ResolversParentTypes['PlanKeys']> = {
  monthly?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  yearly?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PullRequestResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PullRequest'] = ResolversParentTypes['PullRequest']> = {
  author?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  changedFilesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  closedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  gitUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  linesAddedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  linesDeletedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  mergedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  repository?: Resolver<ResolversTypes['Repository'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['PullRequestState'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tracking?: Resolver<ResolversTypes['PullRequestTracking'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PullRequestCreatedEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PullRequestCreatedEvent'] = ResolversParentTypes['PullRequestCreatedEvent']> = {
  eventAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  pullRequest?: Resolver<ResolversTypes['PullRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PullRequestMergedEventResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PullRequestMergedEvent'] = ResolversParentTypes['PullRequestMergedEvent']> = {
  eventAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  pullRequest?: Resolver<ResolversTypes['PullRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PullRequestTrackingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PullRequestTracking'] = ResolversParentTypes['PullRequestTracking']> = {
  changedFilesCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstApprovalAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  firstReviewAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  linesAddedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  linesDeletedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<ResolversTypes['PullRequestSize'], ParentType, ContextType>;
  timeToFirstApproval?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  timeToFirstReview?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  timeToMerge?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PullRequestsInProgressResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PullRequestsInProgressResponse'] = ResolversParentTypes['PullRequestsInProgressResponse']> = {
  changesRequested?: Resolver<Array<ResolversTypes['PullRequest']>, ParentType, ContextType>;
  drafted?: Resolver<Array<ResolversTypes['PullRequest']>, ParentType, ContextType>;
  pendingMerge?: Resolver<Array<ResolversTypes['PullRequest']>, ParentType, ContextType>;
  pendingReview?: Resolver<Array<ResolversTypes['PullRequest']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PurchasablePlansResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PurchasablePlans'] = ResolversParentTypes['PurchasablePlans']> = {
  cloud?: Resolver<ResolversTypes['PlanKeys'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  authProvider?: Resolver<ResolversTypes['AuthProviderResponse'], ParentType, ContextType, RequireFields<QueryAuthProviderArgs, 'input'>>;
  userWorkspaces?: Resolver<Array<ResolversTypes['Workspace']>, ParentType, ContextType>;
  workspace?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<QueryWorkspaceArgs, 'workspaceId'>>;
  workspaceByInstallationId?: Resolver<Maybe<ResolversTypes['Workspace']>, ParentType, ContextType, RequireFields<QueryWorkspaceByInstallationIdArgs, 'gitInstallationId'>>;
};

export type RepositoryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Repository'] = ResolversParentTypes['Repository']> = {
  fullName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  isActive?: SubscriptionResolver<ResolversTypes['Boolean'], "isActive", ParentType, ContextType>;
};

export interface SweetIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SweetID'], any> {
  name: 'SweetID';
}

export type TeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  alert?: Resolver<Maybe<ResolversTypes['Alert']>, ParentType, ContextType, RequireFields<TeamAlertArgs, 'input'>>;
  alerts?: Resolver<Array<ResolversTypes['Alert']>, ParentType, ContextType>;
  archivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  digest?: Resolver<Maybe<ResolversTypes['Digest']>, ParentType, ContextType, RequireFields<TeamDigestArgs, 'input'>>;
  digests?: Resolver<Array<ResolversTypes['Digest']>, ParentType, ContextType>;
  endColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pullRequestsInProgress?: Resolver<ResolversTypes['PullRequestsInProgressResponse'], ParentType, ContextType>;
  startColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workLog?: Resolver<ResolversTypes['TeamWorkLogResponse'], ParentType, ContextType, RequireFields<TeamWorkLogArgs, 'input'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamMember'] = ResolversParentTypes['TeamMember']> = {
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['TeamMemberRole'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamWorkLogResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamWorkLogResponse'] = ResolversParentTypes['TeamWorkLogResponse']> = {
  columns?: Resolver<Array<ResolversTypes['DateTime']>, ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['ActivityEvent']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimeZoneScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['TimeZone'], any> {
  name: 'TimeZone';
}

export type TokenResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = {
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrialResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Trial'] = ResolversParentTypes['Trial']> = {
  endAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type WorkspaceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Workspace'] = ResolversParentTypes['Workspace']> = {
  apiKey?: Resolver<Maybe<ResolversTypes['ApiKey']>, ParentType, ContextType>;
  automation?: Resolver<Maybe<ResolversTypes['Automation']>, ParentType, ContextType, RequireFields<WorkspaceAutomationArgs, 'input'>>;
  automations?: Resolver<Array<ResolversTypes['Automation']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  billing?: Resolver<Maybe<ResolversTypes['Billing']>, ParentType, ContextType>;
  charts?: Resolver<Maybe<ResolversTypes['Charts']>, ParentType, ContextType, RequireFields<WorkspaceChartsArgs, 'input'>>;
  gitUninstallUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  initialSyncProgress?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  integrations?: Resolver<Array<ResolversTypes['Integration']>, ParentType, ContextType>;
  isActiveCustomer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, Partial<WorkspacePeopleArgs>>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<WorkspacePersonArgs, 'handle'>>;
  pullRequests?: Resolver<Array<ResolversTypes['PullRequest']>, ParentType, ContextType, RequireFields<WorkspacePullRequestsArgs, 'input'>>;
  repositories?: Resolver<Array<ResolversTypes['Repository']>, ParentType, ContextType, Partial<WorkspaceRepositoriesArgs>>;
  settings?: Resolver<ResolversTypes['WorkspaceSettings'], ParentType, ContextType>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<WorkspaceTeamArgs, 'teamId'>>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType, Partial<WorkspaceTeamsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceSettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WorkspaceSettings'] = ResolversParentTypes['WorkspaceSettings']> = {
  pullRequest?: Resolver<ResolversTypes['WorkspaceSettingsPullRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceSettingsPullRequestResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WorkspaceSettingsPullRequest'] = ResolversParentTypes['WorkspaceSettingsPullRequest']> = {
  size?: Resolver<ResolversTypes['WorkspaceSettingsPullRequestSize'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceSettingsPullRequestSizeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WorkspaceSettingsPullRequestSize'] = ResolversParentTypes['WorkspaceSettingsPullRequestSize']> = {
  ignorePatterns?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  large?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  medium?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  small?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tiny?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  ActivityEvent?: ActivityEventResolvers<ContextType>;
  Alert?: AlertResolvers<ContextType>;
  ApiKey?: ApiKeyResolvers<ContextType>;
  AuthProviderResponse?: AuthProviderResponseResolvers<ContextType>;
  Automation?: AutomationResolvers<ContextType>;
  AutomationBenefits?: AutomationBenefitsResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  Billing?: BillingResolvers<ContextType>;
  ChartNumericSeries?: ChartNumericSeriesResolvers<ContextType>;
  Charts?: ChartsResolvers<ContextType>;
  CodeReview?: CodeReviewResolvers<ContextType>;
  CodeReviewDistributionChartData?: CodeReviewDistributionChartDataResolvers<ContextType>;
  CodeReviewDistributionEntity?: CodeReviewDistributionEntityResolvers<ContextType>;
  CodeReviewSubmittedEvent?: CodeReviewSubmittedEventResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Digest?: DigestResolvers<ContextType>;
  GraphChartLink?: GraphChartLinkResolvers<ContextType>;
  HexColorCode?: GraphQLScalarType;
  Integration?: IntegrationResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  LoginWithGithubResponse?: LoginWithGithubResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NumericChartData?: NumericChartDataResolvers<ContextType>;
  NumericPersonalMetric?: NumericPersonalMetricResolvers<ContextType>;
  NumericSeriesChartData?: NumericSeriesChartDataResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonalMetrics?: PersonalMetricsResolvers<ContextType>;
  PlanKeys?: PlanKeysResolvers<ContextType>;
  PullRequest?: PullRequestResolvers<ContextType>;
  PullRequestCreatedEvent?: PullRequestCreatedEventResolvers<ContextType>;
  PullRequestMergedEvent?: PullRequestMergedEventResolvers<ContextType>;
  PullRequestTracking?: PullRequestTrackingResolvers<ContextType>;
  PullRequestsInProgressResponse?: PullRequestsInProgressResponseResolvers<ContextType>;
  PurchasablePlans?: PurchasablePlansResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Repository?: RepositoryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SweetID?: GraphQLScalarType;
  Team?: TeamResolvers<ContextType>;
  TeamMember?: TeamMemberResolvers<ContextType>;
  TeamWorkLogResponse?: TeamWorkLogResponseResolvers<ContextType>;
  TimeZone?: GraphQLScalarType;
  Token?: TokenResolvers<ContextType>;
  Trial?: TrialResolvers<ContextType>;
  Void?: GraphQLScalarType;
  Workspace?: WorkspaceResolvers<ContextType>;
  WorkspaceSettings?: WorkspaceSettingsResolvers<ContextType>;
  WorkspaceSettingsPullRequest?: WorkspaceSettingsPullRequestResolvers<ContextType>;
  WorkspaceSettingsPullRequestSize?: WorkspaceSettingsPullRequestSizeResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = GraphQLContext> = {
  rateLimit?: RateLimitDirectiveResolver<any, any, ContextType>;
  skipAuth?: SkipAuthDirectiveResolver<any, any, ContextType>;
};
