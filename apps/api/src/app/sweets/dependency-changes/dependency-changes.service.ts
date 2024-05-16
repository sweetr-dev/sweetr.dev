import { PullRequest } from "@octokit/webhooks-types";
import { getInstallationOctoKit } from "../../../lib/octokit";
import { comparePackageLocks } from "./lock-file.service";
import { env } from "../../../env";
import { DependencyUpdate } from "./lock-file.types";
import { captureException } from "../../../lib/sentry";
import { AutomationSlug } from "@sweetr/graphql-types/api";
import { isAutomationEnabled } from "../automation-setting.service";

export const handlePackageHealthAutomation = async (
  installationId: number,
  pullRequest: PullRequest
) => {
  const isEnabled = await isAutomationEnabled(
    installationId,
    AutomationSlug.PACKAGE_HEALTH
  );

  if (!isEnabled) return;

  const octokit = getInstallationOctoKit(installationId);

  const { data: files } = await octokit.rest.pulls.listFiles({
    pull_number: pullRequest.number,
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
  });

  const lockFiles = files.filter((file) =>
    ["package-lock.json", "yarn.lock"].includes(
      getFileNameFromPath(file.filename)
    )
  );

  // Process lock files in parallel
  Promise.all(
    lockFiles.map(async (lockFile) => {
      const dependencyChanges = await processLockFile(
        installationId,
        pullRequest,
        lockFile
      );

      if (!dependencyChanges) return;

      const comment = await generateComment(
        pullRequest,
        dependencyChanges,
        getFileNameFromPath(lockFile.filename)
      );

      await upsertComment(
        installationId,
        pullRequest,
        lockFile.filename,
        comment
      );
    })
  ).catch((err) => {
    captureException(err, {
      extra: { lockFiles, installationId, pullRequest },
    });
  });
};

const processLockFile = async (
  installationId: number,
  pullRequest: PullRequest,
  lockFile
): Promise<Record<string, DependencyUpdate> | undefined> => {
  const { baseFile, headFile } = await getComparableFiles(
    installationId,
    pullRequest,
    lockFile.filename
  );

  const dependencyChanges = comparePackageLocks(
    lockFile.filename.split("/").at(-1),
    baseFile,
    headFile
  );

  if (Object.values(dependencyChanges).length === 0) return;

  return dependencyChanges;
};

const getTypeLabel = (
  status: "Added" | "Downgraded" | "Removed" | "Upgraded"
) => {
  const labelImg = {
    Added:
      "https://github.com/sweetr-dev/public/blob/main/assets/badges/added.svg?raw=true",
    Downgraded:
      "https://github.com/sweetr-dev/public/blob/main/assets/badges/downgraded.svg?raw=true",
    Removed:
      "https://github.com/sweetr-dev/public/blob/main/assets/badges/removed.svg?raw=true",
    Upgraded:
      "https://github.com/sweetr-dev/public/blob/main/assets/badges/updated.svg?raw=true",
  };

  return `<a href="#"><img alt="${status}" src="${labelImg[status]}" height="16" width="120" /></a>`;
};

const generateComment = async (
  pullRequest: PullRequest,
  dependencyChanges: Record<string, DependencyUpdate>,
  fileName: string
) => {
  const changes = generateTable(dependencyChanges);

  const sha = pullRequest.head.sha.slice(0, 7);
  const commitUrl = `${pullRequest._links.html.href}/commits/${pullRequest.head.sha}`;
  const body = `## Changes on ${fileName} [\`${sha}\`](${commitUrl})
    
  ${changes}
  
  <a href="https://docs.sweetr.dev/features/dependency-changes-summary#how-can-this-help-your-team">How is this helpful?</a>
`;

  return body;
};

const getFileNameFromPath = (path: string): string =>
  path.split("/").at(-1) || "";

const generateTable = (
  dependencyChanges: Record<string, DependencyUpdate>
): string => {
  return `<table role="table">
    <thead>
      <tr>
        <th align="left">Name</th>
        <th align="center">Type</th>
        <th align="center">Previous</th>
        <th align="center">New</th>
        <th align="left"></th>
      </tr>
    </thead>
    <tbody>
      ${Object.values(dependencyChanges)
        .map((change) => {
          return `<tr>
          <td align="left"><code>${change.name}</code></td>
          <td align="center">${getTypeLabel(change.type)}</td>
          <td align="center">${
            "oldVersion" in change ? getReadableVersion(change.oldVersion) : "-"
          }</td>
          <td align="center">${
            "newVersion" in change ? getReadableVersion(change.newVersion) : "-"
          }</td>
          <td align="left">${getDependencyMeta(change)}</td>
        </tr>`;
        })
        .join("")}
      <tr>
        <td align="left"></td>
        <td align="center"></td>
        <td align="center"><img width="80" height="1"></td>
        <td align="center"><img width="80" height="1"></td>
        <td align="right">by <a href="https://sweetr.dev">sweetr.dev</a></td>
      </tr>
    </tbody>
  </table>`;
};

const getDependencyMeta = (change: DependencyUpdate): string => {
  if (change.type === "Removed") return "";

  const publishSizeBadge = `<a href="https://bundlephobia.com/package/${change.name}@${change.newVersion}"><img src="https://img.shields.io/bundlephobia/min/${change.name}/${change.newVersion}?style=flat" /></a>`;
  const packageHealthBadge = `<a href="https://snyk.io/advisor/npm-package/${change.name}"><img src="https://snyk.io/advisor/npm-package/${change.name}/badge.svg" /></a>`;

  return `${packageHealthBadge}<br />${publishSizeBadge}`;
};

const getReadableVersion = (version: string) => {
  return version.split("-").at(0);
};

const upsertComment = async (
  installationId: number,
  pullRequest: PullRequest,
  path: string,
  comment: string
) => {
  const octokit = getInstallationOctoKit(installationId);

  const pullRequestComments = await octokit.rest.pulls.listReviewComments({
    pull_number: pullRequest.number,
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
  });

  const existingComment = pullRequestComments.data.find(
    (comment) =>
      comment.user.login.toString() === `${env.GITHUB_APP_HANDLE}[bot]` &&
      comment.path === path
  );

  if (existingComment) {
    await octokit.rest.pulls.updateReviewComment({
      comment_id: existingComment.id,
      owner: pullRequest.base.repo.owner.login,
      repo: pullRequest.base.repo.name,
      body: comment,
    });

    return;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore OctoKit types are incorrect
  await octokit.rest.pulls.createReviewComment({
    pull_number: pullRequest.number,
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    commit_id: pullRequest.head.sha,
    path,
    body: comment,
    subject_type: "file",
  });
};

const getComparableFiles = async (
  installationId: number,
  pullRequest: PullRequest,
  fileName: string
) => {
  const headBranch = pullRequest.head.ref;
  const baseBranch = pullRequest.base.ref;

  const baseFile = await getFileContentAsJson(
    installationId,
    pullRequest,
    baseBranch,
    fileName
  );

  const headFile = await getFileContentAsJson(
    installationId,
    pullRequest,
    headBranch,
    fileName
  );

  return {
    baseFile,
    headFile,
  };
};

const getFileContentAsJson = async (
  installationId: number,
  pullRequest: PullRequest,
  branch: string,
  path: string
) => {
  const octokit = getInstallationOctoKit(installationId);

  const { data: file } = await octokit.rest.repos.getContent({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    path,
    ref: branch,
  });

  if ("content" in file) {
    return Buffer.from(file.content, "base64").toString();
  }

  throw new Error(`File response for ${path} does not have a content property`);
};
