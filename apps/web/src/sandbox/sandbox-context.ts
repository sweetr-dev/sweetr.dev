import Cookies from "js-cookie";
import { getEnv } from "../env";

export const SANDBOX_STORAGE_KEY = "sweetr-sandbox";

/** Separate from `Authorization` so sandbox does not clobber real sessions in other tabs. */
export const SANDBOX_AUTH_COOKIE = "Sweetr-Sandbox-Authorization";

export const getSandboxCookieAttributes = (): Cookies.CookieAttributes => ({
  domain: getEnv("AUTH_COOKIE_DOMAIN") || undefined,
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
});

export const isSandboxMode = (): boolean => {
  return sessionStorage.getItem(SANDBOX_STORAGE_KEY) === "true";
};

export const clearSandboxMode = (): void => {
  sessionStorage.removeItem(SANDBOX_STORAGE_KEY);
  Cookies.remove(SANDBOX_AUTH_COOKIE, getSandboxCookieAttributes());
};

/** Read-only snapshot of sandbox flag (not a React hook). */
export const getSandboxState = () => {
  return { isSandbox: isSandboxMode() };
};
