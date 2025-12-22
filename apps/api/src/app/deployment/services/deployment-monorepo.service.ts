import micromatch from "micromatch";
import {
  FilterPullRequestsBySubdirectoryArgs,
  HasChangedFilesInSubdirectoryArgs,
} from "./deployment-monorepo.types";

export const filterPullRequestsBySubdirectory = ({
  pullRequests,
  subdirectory,
}: FilterPullRequestsBySubdirectoryArgs) => {
  if (!subdirectory) {
    return pullRequests;
  }

  return pullRequests.filter((pr) => {
    const files = pr.files ? (pr.files as { path: string }[]) : [];

    return hasChangedFilesInSubdirectory({ files, subdirectory });
  });
};

export const hasChangedFilesInSubdirectory = ({
  files,
  subdirectory,
}: HasChangedFilesInSubdirectoryArgs) => {
  return files.some((file) =>
    micromatch.isMatch(file.path, `${subdirectory}/**`)
  );
};
