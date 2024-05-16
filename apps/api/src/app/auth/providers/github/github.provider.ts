import { Installation } from "@octokit/webhooks-types";
import { config } from "../../../../config";
import { getHttpClient } from "../../../../lib/got";
import { UnknownException } from "../../../errors/exceptions/unknown.exception";
import {
  isError,
  GithubOAccessTokenResponse,
  GithubOAuthSuccess,
  GithubUser,
  GithubUserEmail,
} from "./github.types";
import { BusinessRuleException } from "../../../errors/exceptions/business-rule.exception";
import { InputValidationException } from "../../../errors/exceptions/input-validation.exception";

const redirectUrl = config.app.frontend.url.concat(config.github.redirectPath);

// TO-DO: Add "state" to prevent CSRF
export const getGithubAuthtUrl = (state: string): string => {
  const baseUrl = new URL("https://github.com/login/oauth/authorize");

  baseUrl.searchParams.append("client_id", config.github.clientId);

  baseUrl.searchParams.append("redirect_uri", redirectUrl);

  baseUrl.searchParams.append("scope", config.github.scope);

  baseUrl.searchParams.append("state", state);

  return baseUrl.toString();
};

export const authorize = async (code: string): Promise<GithubOAuthSuccess> => {
  const httpClient = await getHttpClient();

  const response = await httpClient
    .post("https://github.com/login/oauth/access_token", {
      responseType: "json",
      json: {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        redirect_uri: redirectUrl,
        code,
      },
    })
    .json<GithubOAccessTokenResponse>();

  if (!isError(response)) {
    return response;
  }

  if (response.error === "bad_verification_code") {
    throw new InputValidationException(
      "Invalid authorization code, please try again."
    );
  }

  throw new UnknownException(
    `GitHub returned an unhandled auth error: ${response.error}.`,
    {
      extra: { error: response },
      severity: "fatal",
    }
  );
};

// TO-DO: Use GitHub's GraphQL API to get all info in one request
export const getUserInfo = async (accessToken: string) => {
  const httpClient = await getHttpClient();

  const requestUser = httpClient
    .get("https://api.github.com/user", {
      responseType: "json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json<GithubUser>();

  const requestEmail = httpClient
    .get("https://api.github.com/user/emails", {
      responseType: "json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json<GithubUserEmail[]>();

  const requestInstallations = httpClient
    .get("https://api.github.com/user/installations", {
      responseType: "json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .json<{ installations: Installation[]; total_count: number }>();

  const [user, emails, installationsResponse] = await Promise.all([
    requestUser,
    requestEmail,
    requestInstallations,
  ]);

  const primaryEmail = emails.find((email) => email.primary)?.email;

  if (!primaryEmail) {
    throw new BusinessRuleException("Could not find user's primary email", {
      extra: { emails },
    });
  }

  return {
    ...user,
    email: primaryEmail,
    emails,
    installations: installationsResponse.installations,
  };
};
