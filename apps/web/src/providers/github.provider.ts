import { LoaderFunction, redirect } from "react-router-dom";
import { isAuthenticated } from "./auth.provider";
import { useAppStore } from "./app.provider";

export const installGithubAppUrl = `https://github.com/apps/${
  import.meta.env.VITE_GITHUB_APP
}/installations/new`;

export const skipOAuthIfAuthenticated: LoaderFunction = async ({ request }) => {
  if (!isAuthenticated()) return null;

  const url = new URL(request.url);

  if (isUrlGithubInstallCallback(url)) {
    const destination = new URL("/github/install", window.location.origin);

    // Forward query parameters
    for (const [key, value] of url.searchParams) {
      destination.searchParams.set(key, value);
    }

    return redirect(`${destination.pathname}${destination.search}`);
  }

  return null;
};

export const isUrlGithubInstallCallback = (url: URL): boolean => {
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");

  return !!installationId && setupAction === "install";
};

export const installGitAppIfNoWorkspaces =
  async (): Promise<Response | null> => {
    const availableWorkspaces = useAppStore.getState().availableWorkspaces;

    if (availableWorkspaces.length === 0) {
      return new Response("", {
        status: 302,
        headers: {
          Location: installGithubAppUrl,
        },
      });
    }

    return null;
  };
