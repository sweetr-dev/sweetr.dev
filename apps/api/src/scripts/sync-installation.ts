import { group } from "radash";
import { addJob, SweetQueue } from "../bull-mq/queues";
import { getAppOctoKit } from "../lib/octokit";

const ownerProfileHandle = "waltergalvao";
const targetHandle = "sweetr-dev";

const run = async () => {
  const octokit = getAppOctoKit();
  const installations = await octokit.rest.apps.listInstallations();

  const installationGroupedByAccount = group(
    installations.data,
    (i) => i.account?.login || "unknown"
  );

  if (!installationGroupedByAccount[targetHandle]?.[0]) {
    console.log(`Installation for ${targetHandle} not found`);
    return;
  }

  const gitProfile = await (
    await fetch(`https://api.github.com/users/${ownerProfileHandle}`)
  ).json();

  if (!gitProfile) {
    console.log(`Git profile for ${ownerProfileHandle} not found`);
    return;
  }

  addJob(SweetQueue.GITHUB_INSTALLATION_SYNC, {
    installation: installationGroupedByAccount[targetHandle][0],
    sender: gitProfile,
  });
};

run().then(() => {
  console.log("Done");
  process.exit(0);
});
