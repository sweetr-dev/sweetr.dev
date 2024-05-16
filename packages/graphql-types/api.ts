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
  SweetID: { input: number; output: number; }
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
};

export type AuthProviderResponse = {
  __typename?: 'AuthProviderResponse';
  redirectUrl: Scalars['String']['output'];
};

export type Automation = {
  __typename?: 'Automation';
  benefits?: Maybe<AutomationBenefits>;
  color: Scalars['String']['output'];
  demoUrl: Scalars['String']['output'];
  description: Scalars['String']['output'];
  docsUrl?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  icon: Scalars['String']['output'];
  overrides: Array<Automation>;
  scope: AutomationScope;
  shortDescription: Scalars['String']['output'];
  slug: AutomationSlug;
  title: Scalars['String']['output'];
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
  slug: AutomationSlug;
};

export enum AutomationScope {
  REPOSITORY = 'REPOSITORY',
  TEAM = 'TEAM',
  WORKSPACE = 'WORKSPACE'
}

export enum AutomationSlug {
  PACKAGE_HEALTH = 'PACKAGE_HEALTH'
}

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

export type GraphChartLink = {
  __typename?: 'GraphChartLink';
  source: Scalars['String']['output'];
  target: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export type LoginWithGithubInput = {
  code: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export type LoginWithGithubResponse = {
  __typename?: 'LoginWithGithubResponse';
  token: Token;
};

export type Mutation = {
  __typename?: 'Mutation';
  archiveTeam: Team;
  loginWithGithub: LoginWithGithubResponse;
  unarchiveTeam: Team;
  updateAutomation: Automation;
  upsertTeam: Team;
};


export type MutationArchiveTeamArgs = {
  input: ArchiveTeamInput;
};


export type MutationLoginWithGithubArgs = {
  input: LoginWithGithubInput;
};


export type MutationUnarchiveTeamArgs = {
  input: UnarchiveTeamInput;
};


export type MutationUpdateAutomationArgs = {
  input: UpdateAutomationInput;
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
  /** The time when the pull request received its first approval */
  firstApprovalAt?: Maybe<Scalars['DateTime']['output']>;
  /** The time when the pull request received its first review */
  firstReviewAt?: Maybe<Scalars['DateTime']['output']>;
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

export type Team = {
  __typename?: 'Team';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endColor: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  members: Array<TeamMember>;
  name: Scalars['String']['output'];
  startColor: Scalars['String']['output'];
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

export type UnarchiveTeamInput = {
  teamId: Scalars['SweetID']['input'];
  workspaceId: Scalars['SweetID']['input'];
};

export type UpdateAutomationInput = {
  enabled: Scalars['Boolean']['input'];
  slug: AutomationSlug;
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
  automation?: Maybe<Automation>;
  automations: Array<Automation>;
  avatar?: Maybe<Scalars['String']['output']>;
  charts?: Maybe<Charts>;
  /** The git provider URL to uninstall the sweetr app */
  gitUninstallUrl: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['SweetID']['output'];
  me?: Maybe<Person>;
  name: Scalars['String']['output'];
  people: Array<Person>;
  person?: Maybe<Person>;
  pullRequests: Array<PullRequest>;
  repositories: Array<Repository>;
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



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ArchiveTeamInput: ResolverTypeWrapper<DeepPartial<ArchiveTeamInput>>;
  AuthProvider: ResolverTypeWrapper<DeepPartial<AuthProvider>>;
  AuthProviderInput: ResolverTypeWrapper<DeepPartial<AuthProviderInput>>;
  AuthProviderResponse: ResolverTypeWrapper<DeepPartial<AuthProviderResponse>>;
  Automation: ResolverTypeWrapper<DeepPartial<Automation>>;
  AutomationBenefits: ResolverTypeWrapper<DeepPartial<AutomationBenefits>>;
  AutomationQueryInput: ResolverTypeWrapper<DeepPartial<AutomationQueryInput>>;
  AutomationScope: ResolverTypeWrapper<DeepPartial<AutomationScope>>;
  AutomationSlug: ResolverTypeWrapper<DeepPartial<AutomationSlug>>;
  BigInt: ResolverTypeWrapper<DeepPartial<Scalars['BigInt']['output']>>;
  Boolean: ResolverTypeWrapper<DeepPartial<Scalars['Boolean']['output']>>;
  ChartInput: ResolverTypeWrapper<DeepPartial<ChartInput>>;
  ChartNumericSeries: ResolverTypeWrapper<DeepPartial<ChartNumericSeries>>;
  Charts: ResolverTypeWrapper<DeepPartial<Charts>>;
  CodeReview: ResolverTypeWrapper<DeepPartial<CodeReview>>;
  CodeReviewDistributionChartData: ResolverTypeWrapper<DeepPartial<CodeReviewDistributionChartData>>;
  CodeReviewDistributionEntity: ResolverTypeWrapper<DeepPartial<CodeReviewDistributionEntity>>;
  CodeReviewState: ResolverTypeWrapper<DeepPartial<CodeReviewState>>;
  CodeReviewsInput: ResolverTypeWrapper<DeepPartial<CodeReviewsInput>>;
  DateTime: ResolverTypeWrapper<DeepPartial<Scalars['DateTime']['output']>>;
  DateTimeRange: ResolverTypeWrapper<DeepPartial<DateTimeRange>>;
  Float: ResolverTypeWrapper<DeepPartial<Scalars['Float']['output']>>;
  GraphChartLink: ResolverTypeWrapper<DeepPartial<GraphChartLink>>;
  HexColorCode: ResolverTypeWrapper<DeepPartial<Scalars['HexColorCode']['output']>>;
  Int: ResolverTypeWrapper<DeepPartial<Scalars['Int']['output']>>;
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
  PullRequest: ResolverTypeWrapper<DeepPartial<PullRequest>>;
  PullRequestOwnerType: ResolverTypeWrapper<DeepPartial<PullRequestOwnerType>>;
  PullRequestSize: ResolverTypeWrapper<DeepPartial<PullRequestSize>>;
  PullRequestState: ResolverTypeWrapper<DeepPartial<PullRequestState>>;
  PullRequestTracking: ResolverTypeWrapper<DeepPartial<PullRequestTracking>>;
  PullRequestTrendInput: ResolverTypeWrapper<DeepPartial<PullRequestTrendInput>>;
  PullRequestsQueryInput: ResolverTypeWrapper<DeepPartial<PullRequestsQueryInput>>;
  Query: ResolverTypeWrapper<{}>;
  RepositoriesQueryInput: ResolverTypeWrapper<DeepPartial<RepositoriesQueryInput>>;
  Repository: ResolverTypeWrapper<DeepPartial<Repository>>;
  String: ResolverTypeWrapper<DeepPartial<Scalars['String']['output']>>;
  SweetID: ResolverTypeWrapper<DeepPartial<Scalars['SweetID']['output']>>;
  Team: ResolverTypeWrapper<DeepPartial<Team>>;
  TeamMember: ResolverTypeWrapper<DeepPartial<TeamMember>>;
  TeamMemberRole: ResolverTypeWrapper<DeepPartial<TeamMemberRole>>;
  TeamsQueryInput: ResolverTypeWrapper<DeepPartial<TeamsQueryInput>>;
  Token: ResolverTypeWrapper<DeepPartial<Token>>;
  UnarchiveTeamInput: ResolverTypeWrapper<DeepPartial<UnarchiveTeamInput>>;
  UpdateAutomationInput: ResolverTypeWrapper<DeepPartial<UpdateAutomationInput>>;
  UpsertTeamInput: ResolverTypeWrapper<DeepPartial<UpsertTeamInput>>;
  UpsertTeamMemberInput: ResolverTypeWrapper<DeepPartial<UpsertTeamMemberInput>>;
  Workspace: ResolverTypeWrapper<DeepPartial<Workspace>>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ArchiveTeamInput: DeepPartial<ArchiveTeamInput>;
  AuthProviderInput: DeepPartial<AuthProviderInput>;
  AuthProviderResponse: DeepPartial<AuthProviderResponse>;
  Automation: DeepPartial<Automation>;
  AutomationBenefits: DeepPartial<AutomationBenefits>;
  AutomationQueryInput: DeepPartial<AutomationQueryInput>;
  BigInt: DeepPartial<Scalars['BigInt']['output']>;
  Boolean: DeepPartial<Scalars['Boolean']['output']>;
  ChartInput: DeepPartial<ChartInput>;
  ChartNumericSeries: DeepPartial<ChartNumericSeries>;
  Charts: DeepPartial<Charts>;
  CodeReview: DeepPartial<CodeReview>;
  CodeReviewDistributionChartData: DeepPartial<CodeReviewDistributionChartData>;
  CodeReviewDistributionEntity: DeepPartial<CodeReviewDistributionEntity>;
  CodeReviewsInput: DeepPartial<CodeReviewsInput>;
  DateTime: DeepPartial<Scalars['DateTime']['output']>;
  DateTimeRange: DeepPartial<DateTimeRange>;
  Float: DeepPartial<Scalars['Float']['output']>;
  GraphChartLink: DeepPartial<GraphChartLink>;
  HexColorCode: DeepPartial<Scalars['HexColorCode']['output']>;
  Int: DeepPartial<Scalars['Int']['output']>;
  LoginWithGithubInput: DeepPartial<LoginWithGithubInput>;
  LoginWithGithubResponse: DeepPartial<LoginWithGithubResponse>;
  Mutation: {};
  NumericChartData: DeepPartial<NumericChartData>;
  NumericPersonalMetric: DeepPartial<NumericPersonalMetric>;
  NumericSeriesChartData: DeepPartial<NumericSeriesChartData>;
  PeopleQueryInput: DeepPartial<PeopleQueryInput>;
  Person: DeepPartial<Person>;
  PersonalMetrics: DeepPartial<PersonalMetrics>;
  PullRequest: DeepPartial<PullRequest>;
  PullRequestTracking: DeepPartial<PullRequestTracking>;
  PullRequestTrendInput: DeepPartial<PullRequestTrendInput>;
  PullRequestsQueryInput: DeepPartial<PullRequestsQueryInput>;
  Query: {};
  RepositoriesQueryInput: DeepPartial<RepositoriesQueryInput>;
  Repository: DeepPartial<Repository>;
  String: DeepPartial<Scalars['String']['output']>;
  SweetID: DeepPartial<Scalars['SweetID']['output']>;
  Team: DeepPartial<Team>;
  TeamMember: DeepPartial<TeamMember>;
  TeamsQueryInput: DeepPartial<TeamsQueryInput>;
  Token: DeepPartial<Token>;
  UnarchiveTeamInput: DeepPartial<UnarchiveTeamInput>;
  UpdateAutomationInput: DeepPartial<UpdateAutomationInput>;
  UpsertTeamInput: DeepPartial<UpsertTeamInput>;
  UpsertTeamMemberInput: DeepPartial<UpsertTeamMemberInput>;
  Workspace: DeepPartial<Workspace>;
};

export type SkipAuthDirectiveArgs = { };

export type SkipAuthDirectiveResolver<Result, Parent, ContextType = GraphQLContext, Args = SkipAuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AuthProviderResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AuthProviderResponse'] = ResolversParentTypes['AuthProviderResponse']> = {
  redirectUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AutomationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Automation'] = ResolversParentTypes['Automation']> = {
  benefits?: Resolver<Maybe<ResolversTypes['AutomationBenefits']>, ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  demoUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  docsUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  overrides?: Resolver<Array<ResolversTypes['Automation']>, ParentType, ContextType>;
  scope?: Resolver<ResolversTypes['AutomationScope'], ParentType, ContextType>;
  shortDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['AutomationSlug'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type GraphChartLinkResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['GraphChartLink'] = ResolversParentTypes['GraphChartLink']> = {
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface HexColorCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['HexColorCode'], any> {
  name: 'HexColorCode';
}

export type LoginWithGithubResponseResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LoginWithGithubResponse'] = ResolversParentTypes['LoginWithGithubResponse']> = {
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  archiveTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationArchiveTeamArgs, 'input'>>;
  loginWithGithub?: Resolver<ResolversTypes['LoginWithGithubResponse'], ParentType, ContextType, RequireFields<MutationLoginWithGithubArgs, 'input'>>;
  unarchiveTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationUnarchiveTeamArgs, 'input'>>;
  updateAutomation?: Resolver<ResolversTypes['Automation'], ParentType, ContextType, RequireFields<MutationUpdateAutomationArgs, 'input'>>;
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

export type PullRequestTrackingResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PullRequestTracking'] = ResolversParentTypes['PullRequestTracking']> = {
  firstApprovalAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  firstReviewAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  size?: Resolver<ResolversTypes['PullRequestSize'], ParentType, ContextType>;
  timeToFirstApproval?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  timeToFirstReview?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  timeToMerge?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
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

export interface SweetIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['SweetID'], any> {
  name: 'SweetID';
}

export type TeamResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  archivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['TeamMember']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startColor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamMemberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TeamMember'] = ResolversParentTypes['TeamMember']> = {
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  person?: Resolver<ResolversTypes['Person'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['TeamMemberRole'], ParentType, ContextType>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TokenResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = {
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkspaceResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Workspace'] = ResolversParentTypes['Workspace']> = {
  automation?: Resolver<Maybe<ResolversTypes['Automation']>, ParentType, ContextType, RequireFields<WorkspaceAutomationArgs, 'input'>>;
  automations?: Resolver<Array<ResolversTypes['Automation']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  charts?: Resolver<Maybe<ResolversTypes['Charts']>, ParentType, ContextType, RequireFields<WorkspaceChartsArgs, 'input'>>;
  gitUninstallUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  handle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['SweetID'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  people?: Resolver<Array<ResolversTypes['Person']>, ParentType, ContextType, Partial<WorkspacePeopleArgs>>;
  person?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType, RequireFields<WorkspacePersonArgs, 'handle'>>;
  pullRequests?: Resolver<Array<ResolversTypes['PullRequest']>, ParentType, ContextType, RequireFields<WorkspacePullRequestsArgs, 'input'>>;
  repositories?: Resolver<Array<ResolversTypes['Repository']>, ParentType, ContextType, Partial<WorkspaceRepositoriesArgs>>;
  team?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<WorkspaceTeamArgs, 'teamId'>>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType, Partial<WorkspaceTeamsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AuthProviderResponse?: AuthProviderResponseResolvers<ContextType>;
  Automation?: AutomationResolvers<ContextType>;
  AutomationBenefits?: AutomationBenefitsResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  ChartNumericSeries?: ChartNumericSeriesResolvers<ContextType>;
  Charts?: ChartsResolvers<ContextType>;
  CodeReview?: CodeReviewResolvers<ContextType>;
  CodeReviewDistributionChartData?: CodeReviewDistributionChartDataResolvers<ContextType>;
  CodeReviewDistributionEntity?: CodeReviewDistributionEntityResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  GraphChartLink?: GraphChartLinkResolvers<ContextType>;
  HexColorCode?: GraphQLScalarType;
  LoginWithGithubResponse?: LoginWithGithubResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NumericChartData?: NumericChartDataResolvers<ContextType>;
  NumericPersonalMetric?: NumericPersonalMetricResolvers<ContextType>;
  NumericSeriesChartData?: NumericSeriesChartDataResolvers<ContextType>;
  Person?: PersonResolvers<ContextType>;
  PersonalMetrics?: PersonalMetricsResolvers<ContextType>;
  PullRequest?: PullRequestResolvers<ContextType>;
  PullRequestTracking?: PullRequestTrackingResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Repository?: RepositoryResolvers<ContextType>;
  SweetID?: GraphQLScalarType;
  Team?: TeamResolvers<ContextType>;
  TeamMember?: TeamMemberResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  Workspace?: WorkspaceResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = GraphQLContext> = {
  skipAuth?: SkipAuthDirectiveResolver<any, any, ContextType>;
};
