import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

import { getAppOctoKit } from "../lib/octokit";

const octokit = getAppOctoKit();

octokit.rest.apps.listInstallations().then((response) => {
  for (const installation of response.data) {
    console.log("-----------------------------------");
    console.log(installation);
  }
});
