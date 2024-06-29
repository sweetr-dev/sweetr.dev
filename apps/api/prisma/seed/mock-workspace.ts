import {
  Prisma,
  GitProvider,
  PrismaClient,
  Workspace,
  PullRequestState,
  PullRequest,
  CodeReview,
  CodeReviewState,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import {
  getCycleTime,
  getPullRequestSize,
  getTimeToCode,
  getTimeToMerge,
} from "../../src/app/github/services/github-pull-request-tracking.service";
import { getBypassRlsPrisma } from "../../src/prisma";
import { parseNullableISO } from "../../src/lib/date";
import { addDays, addHours, addMinutes, isSunday, subDays } from "date-fns";

export const seedMockWorkspace = async (prisma: PrismaClient) => {
  const organization = await getBypassRlsPrisma().organization.upsert({
    where: {
      gitProvider_gitOrganizationId: {
        gitOrganizationId: "0",
        gitProvider: GitProvider.GITHUB,
      },
    },
    create: {
      gitProvider: GitProvider.GITHUB,
      gitOrganizationId: "0",
      handle: "acme",
      name: "acme",
    },
    update: {
      gitProvider: GitProvider.GITHUB,
      gitOrganizationId: "0",
      handle: "acme",
      name: "acme",
    },
  });

  const workspace = await getBypassRlsPrisma().workspace.upsert({
    where: {
      organizationId: organization.id,
    },
    create: {
      gitProvider: GitProvider.GITHUB,
      organizationId: organization.id,
    },
    update: {
      gitProvider: GitProvider.GITHUB,
      organizationId: organization.id,
    },
  });

  await seedRepositories(workspace);
  await seedGitProfiles(workspace);
  await seedPullRequests(workspace);
};

const seedRepositories = async (workspace: Workspace) => {
  for (let i = 0; i < 3; i++) {
    const name = faker.git.branch();
    const data = {
      name,
      fullName: `acme/${name}`,
      gitProvider: GitProvider.GITHUB,
      gitRepositoryId: `${i}`,
      isFork: false,
      isMirror: false,
      isPrivate: true,
      workspaceId: workspace.id,
      starCount: faker.number.int({ min: 1, max: 15000 }),
      description: faker.lorem.sentence(),
      createdAt: new Date(),
    };

    console.log(`🌱 Seeding Repository: ${data.fullName}`);

    await getBypassRlsPrisma().repository.upsert({
      where: {
        gitProvider_gitRepositoryId: {
          gitProvider: GitProvider.GITHUB,
          gitRepositoryId: `${i}`,
        },
      },
      create: data,
      update: data,
    });
  }
};

const seedGitProfiles = async (workspace: Workspace) => {
  for (let i = 0; i < 15; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const data = {
      name: `${firstName} ${lastName}`,
      handle: faker.internet.userName({ firstName, lastName }),
      avatar: faker.image.avatarGitHub(),
      gitProvider: GitProvider.GITHUB,
      gitUserId: `${i}`,
    };

    console.log(`🌱 Seeding GitProfile: ${data.name}`);

    const gitProfile = await getBypassRlsPrisma().gitProfile.upsert({
      where: {
        gitProvider_gitUserId: {
          gitProvider: GitProvider.GITHUB,
          gitUserId: `${i}`,
        },
      },
      create: data,
      update: data,
    });

    await getBypassRlsPrisma().workspaceMembership.upsert({
      where: {
        gitProfileId_workspaceId: {
          gitProfileId: gitProfile.id,
          workspaceId: workspace.id,
        },
      },
      create: {
        gitProfileId: gitProfile.id,
        workspaceId: workspace.id,
      },
      update: {
        gitProfileId: gitProfile.id,
        workspaceId: workspace.id,
      },
    });
  }
};

const seedPullRequests = async (workspace: Workspace) => {
  const repositories = await getBypassRlsPrisma().repository.findMany();
  const gitProfiles = await getBypassRlsPrisma().gitProfile.findMany();

  const openPRs = faker.number.int({ min: 1, max: 4 });

  console.log(`🌱 Seeding PRs for last 5 days`);

  for (const gitProfile of gitProfiles) {
    for (let i = 0; i < openPRs; i++) {
      const repository = faker.helpers.arrayElement(repositories);

      const pullRequest = await createPullRequest({
        gitPullRequestId: `seed-${i}`,
        repositoryId: repository.id,
        authorId: gitProfile.id,
        workspaceId: workspace.id,
        createdAt: faker.date.recent({ days: 5 }),
        state: PullRequestState.OPEN,
      });

      await createReviewsForPullRequest(pullRequest, workspace.id);
    }
  }

  const startDate = subDays(new Date(), 360);

  for (let date = startDate; date < new Date(); date = addDays(date, 1)) {
    console.log(`🌱 Seeding PRs for ${date}`);

    if (isSunday(date)) continue; // Skip Sundays

    for (const gitProfile of gitProfiles) {
      const PRsPerPerson = faker.number.int({ min: 0, max: 4 });

      console.log(` ${PRsPerPerson} PRs for ${gitProfile.name}`);

      for (let i = openPRs; i < openPRs + PRsPerPerson; i++) {
        const repository = faker.helpers.arrayElement(repositories);
        const createdAt = faker.date.between({
          from: date,
          to: addHours(date, 23),
        });

        const state =
          Math.random() < 0.8
            ? PullRequestState.MERGED
            : PullRequestState.CLOSED;

        const pullRequest = await createPullRequest({
          gitPullRequestId: `seed-${date.valueOf()}-${i}`,
          repositoryId: repository.id,
          authorId: gitProfile.id,
          workspaceId: workspace.id,
          createdAt,
          state,
        });

        await createReviewsForPullRequest(pullRequest, workspace.id);
      }
    }
  }
};

const createPullRequest = async ({
  gitPullRequestId,
  repositoryId,
  authorId,
  workspaceId,
  createdAt,
  state,
}: {
  gitPullRequestId: string;
  repositoryId: number;
  authorId: number;
  workspaceId: number;
  createdAt: Date;
  state: PullRequestState;
}) => {
  const linesAddedCount = faker.number.int({ min: 5, max: 1500 });
  const linesDeletedCount = faker.number.int({ min: 5, max: 1500 });
  const changedFilesCount = faker.number.int({ min: 1, max: 40 });

  const closedAt =
    state === PullRequestState.CLOSED
      ? faker.date.between({ from: createdAt, to: addHours(createdAt, 30) })
      : null;

  const mergedAt =
    state === PullRequestState.MERGED
      ? faker.date.between({ from: createdAt, to: addHours(createdAt, 30) })
      : null;

  const data = {
    gitProvider: GitProvider.GITHUB,
    gitPullRequestId,
    repositoryId,
    authorId,
    workspaceId,
    number: faker.number.int({ min: 1, max: 9999 }).toString(),
    title: faker.git.commitMessage(),
    changedFilesCount,
    commentCount: faker.number.int({ min: 0, max: 30 }),
    closedAt,
    gitUrl: "https://github.com",
    linesAddedCount,
    linesDeletedCount,
    mergedAt,
    state,
    createdAt,
    updatedAt: createdAt,
  };

  const pullRequest = await getBypassRlsPrisma().pullRequest.upsert({
    where: {
      gitProvider_gitPullRequestId: {
        gitProvider: GitProvider.GITHUB,
        gitPullRequestId,
      },
    },
    create: data,
    update: data,
  });

  return pullRequest;
};

const createReviewsForPullRequest = async (
  pullRequest: PullRequest,
  workspaceId: number
) => {
  const reviews: CodeReview[] = [];
  const numReviews = faker.number.int({ min: 1, max: 3 });

  console.log(
    `🌱 Seeding ${numReviews} reviews for PR ${pullRequest.gitPullRequestId}`
  );

  for (let i = 0; i < numReviews; i++) {
    const state = faker.helpers.arrayElement([
      CodeReviewState.APPROVED,
      CodeReviewState.CHANGES_REQUESTED,
      CodeReviewState.COMMENTED,
    ]);

    const data = {
      pullRequestId: pullRequest.id,
      authorId: pullRequest.authorId,
      workspaceId,
      state,
      commentCount: faker.number.int({ min: 0, max: 10 }),
      createdAt: faker.date.between({
        from: pullRequest.createdAt,
        to: addHours(pullRequest.createdAt, 30),
      }),
      updatedAt: new Date(),
    };

    const review = await getBypassRlsPrisma().codeReview.upsert({
      where: {
        pullRequestId_authorId: {
          pullRequestId: pullRequest.id,
          authorId: pullRequest.authorId,
        },
      },
      create: data,
      update: data,
    });

    reviews.push(review);
  }

  await createPullRequestTracking({ pullRequest, reviews });
};

const createPullRequestTracking = async ({
  pullRequest,
  reviews,
}: {
  pullRequest: PullRequest;
  reviews: CodeReview[];
}) => {
  const size = getPullRequestSize(pullRequest);
  const firstCommitAt = faker.date.between({
    from: pullRequest.createdAt,
    to: addMinutes(pullRequest.createdAt, 30),
  });
  const firstDraftedAt = faker.date.between({
    from: pullRequest.createdAt,
    to: addHours(pullRequest.createdAt, 30),
  });
  const firstReadyAt = faker.date.between({
    from: firstDraftedAt,
    to: addHours(firstDraftedAt, 30),
  });

  const firstApprovalAt = parseNullableISO(
    reviews
      .find((review) => review.state === CodeReviewState.APPROVED)
      ?.createdAt.toISOString()
  );
  const timeToMerge = getTimeToMerge(pullRequest, firstApprovalAt);
  const timeToCode = getTimeToCode(firstCommitAt, firstReadyAt);
  const cycleTime = getCycleTime(pullRequest, new Date());

  console.log(`🌱 Seeding PR Tracking for PR ${pullRequest.gitPullRequestId}`);

  await getBypassRlsPrisma().pullRequestTracking.upsert({
    where: {
      pullRequestId: pullRequest.id,
    },
    create: {
      pullRequestId: pullRequest.id,
      workspaceId: pullRequest.workspaceId,
      size,
      firstCommitAt,
      firstDraftedAt,
      firstReadyAt,
      timeToMerge,
      timeToCode,
      cycleTime,
    },
    update: {
      size,
      firstCommitAt,
      firstDraftedAt,
      firstReadyAt,
      timeToMerge,
      timeToCode,
      cycleTime,
    },
  });
};
