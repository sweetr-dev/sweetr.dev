import { redirect } from "react-router";
import Cookies from "js-cookie";
import { setAuthorizationHeader } from "../api/clients/graphql-client";
import {
  clearSandboxMode,
  getSandboxCookieAttributes,
  SANDBOX_AUTH_COOKIE,
  SANDBOX_STORAGE_KEY,
} from "./sandbox-context";

const SANDBOX_COOKIE_VALUE = "sandbox-mode";

let workerStarted = false;

/**
 * Starts the MSW worker if not already running and sets the auth header.
 * Called both from the /sandbox entry and on page refresh when sandbox is active.
 */
export const ensureSandboxWorker = async () => {
  if (!workerStarted) {
    try {
      const { worker } = await import("./worker");
      await worker.start({
        onUnhandledRequest: "bypass",
        quiet: true,
      });
      workerStarted = true;
    } catch (e) {
      clearSandboxMode();
      throw e;
    }
  }

  setAuthorizationHeader(SANDBOX_COOKIE_VALUE);
};

/** Stops MSW so non-sandbox navigations hit the real API. */
export const stopSandboxWorker = async (): Promise<void> => {
  if (!workerStarted) {
    return;
  }
  const { worker } = await import("./worker");
  await worker.stop();
  workerStarted = false;
};

/**
 * Loader for the /sandbox entry route.
 * Starts MSW, sets a fake auth cookie, marks sandbox mode in sessionStorage,
 * then redirects to / (or ?redirectTo=) where the normal auth flow picks up (MSW intercepts all queries).
 */
export const sandboxLoader = async ({ request }: { request: Request }) => {
  await ensureSandboxWorker();

  sessionStorage.setItem(SANDBOX_STORAGE_KEY, "true");

  Cookies.set(SANDBOX_AUTH_COOKIE, SANDBOX_COOKIE_VALUE, {
    ...getSandboxCookieAttributes(),
  });

  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  // Only allow same-origin relative paths to avoid open redirects.
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  return redirect(safeRedirect);
};
