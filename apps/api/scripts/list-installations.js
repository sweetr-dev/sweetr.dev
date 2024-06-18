const { Octokit } = require("octokit");
const { createAppAuth } = require("@octokit/auth-app");
require("dotenv").config({ path: "../.env" });

// Replace these values with your app's credentials
const APP_ID = process.env.GITHUB_APP_ID; // Your GitHub App ID
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY; // Your GitHub App's private key
const CLIENT_ID = process.env.GITHUB_CLIENT_ID; // Your GitHub App's client ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET; // Your GitHub App's client secret

async function listInstallations() {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: APP_ID,
      privateKey: PRIVATE_KEY,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    },
  });

  try {
    const response = await octokit.request("GET /app/installations", {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    });

    console.log("Installations:");
    response.data.forEach((installation) => {
      console.log(
        `- ID: ${installation.id}, Account: ${installation.account.login}`
      );
    });
  } catch (error) {
    console.error("Error fetching installations:", error);
  }
}

listInstallations();
