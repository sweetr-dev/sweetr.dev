import { redirect } from "react-router";
import Cookies from "js-cookie";
import { setAuthorizationHeader } from "../api/clients/graphql-client";
import { getEnv } from "../env";

const SANDBOX_COOKIE_VALUE = "sandbox-mode";
const SANDBOX_STORAGE_KEY = "sweetr-sandbox";

let workerStarted = false;

/**
 * Starts the MSW worker if not already running and sets the auth header.
 * Called both from the /sandbox entry and on page refresh when sandbox is active.
 */
export const ensureSandboxWorker = async () => {
  if (!workerStarted) {
    const { worker } = await import("./worker");
    await worker.start({
      onUnhandledRequest: "bypass",
      quiet: true,
    });
    workerStarted = true;
  }

  setAuthorizationHeader(SANDBOX_COOKIE_VALUE);
};

/**
 * Loader for the /sandbox entry route.
 * Starts MSW, sets a fake auth cookie, marks sandbox mode in sessionStorage,
 * then redirects to / where the normal auth flow picks up (MSW intercepts all queries).
 */
export const sandboxLoader = async () => {
  await ensureSandboxWorker();

  sessionStorage.setItem(SANDBOX_STORAGE_KEY, "true");

  Cookies.set("Authorization", SANDBOX_COOKIE_VALUE, {
    domain: getEnv("AUTH_COOKIE_DOMAIN"),
    secure: true,
  });

  return redirect("/");
};
