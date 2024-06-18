const { Octokit } = require("octokit");
const { createAppAuth } = require("@octokit/auth-app");
require("dotenv").config({ path: "../.env" });

// Replace these values with your app's credentials
const APP_ID = process.env.GITHUB_APP_ID; // Your GitHub App ID
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY; // Your GitHub App's private key
const CLIENT_ID = process.env.GITHUB_CLIENT_ID; // Your GitHub App's client ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET; // Your GitHub App's client secret

async function removeInstallations() {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: APP_ID,
      privateKey: PRIVATE_KEY,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    },
  });

  const installationIds = ["51961820", "51930124", "51490741"];

  for (const installationId of installationIds) {
    try {
      const response = await octokit.request(
        `DELETE /app/installations/${installationId}`,
        {
          headers: {
            accept: "application/vnd.github.v3+json",
          },
        }
      );

      console.log(`Successfully deleted installation ID: ${installationId}`);
      console.log(response);
    } catch (error) {
      console.error("Error deleting installation:", installationId);
      console.error(error);
    }
  }
}

removeInstallations();
