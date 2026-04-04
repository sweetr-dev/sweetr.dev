const SANDBOX_STORAGE_KEY = "sweetr-sandbox";

export const isSandboxMode = (): boolean => {
  return sessionStorage.getItem(SANDBOX_STORAGE_KEY) === "true";
};

export const clearSandboxMode = (): void => {
  sessionStorage.removeItem(SANDBOX_STORAGE_KEY);
};

export const useSandbox = () => {
  return { isSandbox: isSandboxMode() };
};
