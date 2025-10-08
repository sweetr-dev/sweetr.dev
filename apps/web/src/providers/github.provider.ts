import { LoaderFunction, redirect } from "react-router-dom";
import { isAuthenticated } from "./auth.provider";
import { useAppStore } from "./app.provider";
import { showWarningNotification } from "./notification.provider";

export const installGithubAppUrl = `https://github.com/apps/${
  import.meta.env.VITE_GITHUB_APP
}/installations/new`;

export const handleOAuthRedirect: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);

  if (isGithubInstallRequestCallback(url)) {
    showWarningNotification({
      title: "Thank you",
      message:
        "You will get access once your organization approves the app install.",
      autoClose: false,
    });
    return redirect(`/`);
  }

  if (!isAuthenticated()) return null;

  if (isGithubInstallSuccessCallback(url)) {
    const destination = new URL("/github/install", window.location.origin);

    // Forward query parameters
    for (const [key, value] of url.searchParams) {
      destination.searchParams.set(key, value);
    }

    return redirect(`${destination.pathname}${destination.search}`);
  }

  return null;
};

export const isGithubInstallRequestCallback = (url: URL): boolean => {
  const setupAction = url.searchParams.get("setup_action");

  return setupAction === "request";
};

export const isGithubInstallSuccessCallback = (url: URL): boolean => {
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");

  return !!installationId && setupAction === "install";
};

export const installGitAppIfNoWorkspaces = (): Response | null => {
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
